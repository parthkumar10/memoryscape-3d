import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

export interface OcrProgress {
  page: number;
  totalPages: number;
  percent: number;
  status: string;
}

export interface OcrResult {
  fullText: string;
  paragraphs: Array<{ id: string; ref: string; text: string }>;
  pageCount: number;
  isScanned: true;
  characterCount: number;
  warning?: string;
}

const MAX_OCR_PAGES = 10;
const MAX_RENDER_WIDTH = 1600;

export async function extractPdfTextWithOcr(
  file: File,
  onProgress: (progress: OcrProgress) => void
): Promise<OcrResult> {
  const [{ createWorker }, pdfjs] = await Promise.all([
    import('tesseract.js'),
    import('pdfjs-dist'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    useSystemFonts: true,
  });
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  let pdf: Awaited<typeof loadingTask.promise> | null = null;

  try {
    pdf = await loadingTask.promise;
    const pagesToProcess = Math.min(pdf.numPages, MAX_OCR_PAGES);
    const pageTexts: string[] = [];
    const paragraphs: OcrResult['paragraphs'] = [];
    let characterCount = 0;

    worker = await createWorker('eng', 1, {
      logger: ({ status, progress }) => {
        onProgress({
          page: pageTexts.length + 1,
          totalPages: pagesToProcess,
          percent: Math.min(100, Math.round(((pageTexts.length + progress) / pagesToProcess) * 100)),
          status,
        });
      },
    });

    for (let pageNumber = 1; pageNumber <= pagesToProcess; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(2, MAX_RENDER_WIDTH / baseViewport.width);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      try {
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Your browser could not prepare a canvas for PDF text recognition.');
        }
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const { data } = await worker.recognize(canvas);
        const lines = data.text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
        const pageText = lines.join('\n');
        pageTexts.push(pageText);

        if (pageText) {
          characterCount += pageText.length;
          paragraphs.push({
            id: `p-ocr-${pageNumber}-1`,
            ref: `Page ${pageNumber}, OCR`,
            text: pageText,
          });
        }

        onProgress({
          page: pageNumber,
          totalPages: pagesToProcess,
          percent: Math.round((pageNumber / pagesToProcess) * 100),
          status: 'Recognized page',
        });
      } finally {
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
      }
    }

    if (characterCount < 40) {
      throw new Error('OCR could not find enough readable text. Try a clearer scan or paste the notes instead.');
    }

    const fullText = paragraphs.map(({ ref, text }) => `[${ref}]\n${text}`).join('\n\n');
    return {
      fullText,
      paragraphs,
      pageCount: pdf.numPages,
      isScanned: true,
      characterCount,
      warning:
        pdf.numPages > MAX_OCR_PAGES
          ? `OCR processed the first ${MAX_OCR_PAGES} of ${pdf.numPages} pages. Upload a shorter section to process the remaining pages.`
          : undefined,
    };
  } finally {
    await worker?.terminate();
    await loadingTask.destroy();
  }
}
