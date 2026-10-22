import { SourceParagraph } from '../../types/index.ts';

export interface ExtractedDocResult {
  fullText: string;
  paragraphs: SourceParagraph[];
  pageCount: number;
  isScanned: boolean;
  characterCount: number;
  warning?: string;
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<ExtractedDocResult> {
  // Use legacy build for stable Node.js server execution
  // @ts-ignore
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
  });

  const pdfDocument = await loadingTask.promise;
  const numPages = Math.min(pdfDocument.numPages, 25); // cap at 25 pages
  const paragraphs: SourceParagraph[] = [];
  const fullTextParts: string[] = [];

  let totalChars = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group text items by vertical lines or reasonable line breaks
    let pageText = '';
    let lastY: number | null = null;

    for (const item of textContent.items as any[]) {
      if ('str' in item) {
        const str = item.str;
        if (!str) continue;

        // detect new line based on transform Y position
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          pageText += ' ';
        }

        pageText += str;
        lastY = item.transform[5];
      }
    }

    const rawBlocks = pageText
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    let paraIndex = 1;
    for (const block of rawBlocks) {
      totalChars += block.length;
      const ref = `Page ${pageNum}, ¶${paraIndex++}`;
      paragraphs.push({
        id: `p-${pageNum}-${paraIndex}`,
        ref,
        text: block,
      });
      fullTextParts.push(`[${ref}]\n${block}`);
    }
  }

  // Detect scanned / image-only PDF
  const isScanned = totalChars < 40 && numPages > 0;
  const warning = isScanned
    ? 'This PDF appears to be a scanned image with no embedded text layer. Scanned documents require OCR. Please paste your text directly or export as a searchable PDF.'
    : undefined;

  return {
    fullText: fullTextParts.join('\n\n'),
    paragraphs,
    pageCount: pdfDocument.numPages,
    isScanned,
    characterCount: totalChars,
    warning,
  };
}
