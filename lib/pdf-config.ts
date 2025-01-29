import * as pdfjs from 'pdfjs-dist';

export const PDF_CONFIG = {
  verbosity: 0,
  useSystemFonts: true,
  isEvalSupported: false
};

export async function getDocument(data: Uint8Array) {
  // Only initialize worker when needed
  if (typeof window !== 'undefined') {
    // Client-side
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  } else {
    // Server-side
    const worker = await import('pdfjs-dist/build/pdf.worker.mjs');
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = worker;
    }
  }

  return pdfjs.getDocument({
    data,
    ...PDF_CONFIG
  }).promise;
} 