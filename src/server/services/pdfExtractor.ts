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
  // Load the worker into the Node process so serverless bundlers include it for PDF.js's fake worker.
  // @ts-ignore
  await import('pdfjs-dist/legacy/build/pdf.worker.mjs');

  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
  });

  let pdfDocument: Awaited<typeof loadingTask.promise> | null = null;
  try {
    pdfDocument = await loadingTask.promise;
    if (pdfDocument.numPages > 25) {
      throw new Error('PDFs must contain 25 pages or fewer. Please upload a shorter section.');
    }

    const numPages = pdfDocument.numPages;
    const paragraphs: SourceParagraph[] = [];
    const fullTextParts: string[] = [];

    let totalChars = 0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      let pageText = '';
      let lastY: number | null = null;

      for (const item of textContent.items as any[]) {
        if ('str' in item) {
          const str = item.str;
          if (!str) continue;

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
        .map((block) => block.trim())
        .filter((block) => block.length > 0);

      let paragraphNumber = 1;
      for (const block of rawBlocks) {
        totalChars += block.length;
        const ref = `Page ${pageNum}, ¶${paragraphNumber}`;
        paragraphs.push({
          id: `p-${pageNum}-${paragraphNumber}`,
          ref,
          text: block,
        });
        fullTextParts.push(`[${ref}]\n${block}`);
        paragraphNumber += 1;
      }
    }

    const isScanned = totalChars < 40 && numPages > 0;
    const warning = isScanned
      ? 'This PDF appears to be scanned. English OCR will run in your browser for up to 10 pages.'
      : undefined;

    return {
      fullText: fullTextParts.join('\n\n'),
      paragraphs,
      pageCount: pdfDocument.numPages,
      isScanned,
      characterCount: totalChars,
      warning,
    };
  } finally {
    await loadingTask.destroy();
  }
}
