interface PdfJsLib {
  getDocument: (source: any) => { promise: Promise<PdfDocument> };
  GlobalWorkerOptions: { workerSrc: string };
}

interface PdfDocument {
  numPages: number;
  getPage: (pageNum: number) => Promise<PdfPage>;
  getMetadata: () => Promise<{ info?: Record<string, any>; metadata?: Record<string, any> }>;
}

interface PdfPage {
  getTextContent: () => Promise<{ items: Array<{ str: string }> }>;
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

export interface PdfTextContent {
  text: string;
  pages: string[];
}

const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const getPdfJsLib = (): PdfJsLib => {
  console.log('[getPdfJsLib] Checking PDF.js library availability');
  if (!window.pdfjsLib) {
    console.error('[getPdfJsLib] PDF.js library not loaded');
    throw new Error('PDF.js library not loaded. Please include pdf.js in your HTML.');
  }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  console.log('[getPdfJsLib] PDF.js library initialized');
  return window.pdfjsLib;
};

const extractTextFromPdf = async (pdf: PdfDocument): Promise<PdfTextContent> => {
  console.log('[extractTextFromPdf] Starting text extraction');
  console.log('[extractTextFromPdf] Total pages:', pdf.numPages);
  
  const pages: string[] = [];
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    console.log('[extractTextFromPdf] Processing page', pageNum, 'of', pdf.numPages);
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    pages.push(pageText);
    fullText += pageText + '\n\n';
    console.log('[extractTextFromPdf] Page', pageNum, 'text length:', pageText.length);
  }

  const result = {
    text: fullText.trim(),
    pages
  };
  console.log('[extractTextFromPdf] Extraction completed, total text length:', result.text.length);
  return result;
};

export const readPdfFile = async (file: File): Promise<PdfTextContent> => {
  console.log('[readPdfFile] Starting PDF file read');
  console.log('[readPdfFile] File name:', file.name);
  console.log('[readPdfFile] File size:', file.size, 'bytes');
  console.log('[readPdfFile] File type:', file.type);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        console.log('[readPdfFile] File read completed, parsing PDF');
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          console.error('[readPdfFile] Failed to get array buffer');
          reject(new Error('Failed to read file'));
          return;
        }
        console.log('[readPdfFile] Array buffer size:', arrayBuffer.byteLength, 'bytes');

        const pdfjsLib = getPdfJsLib();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        console.log('[readPdfFile] Loading PDF document');
        const pdf = await loadingTask.promise;
        console.log('[readPdfFile] PDF document loaded');
        const result = await extractTextFromPdf(pdf);
        console.log('[readPdfFile] PDF read completed successfully');
        resolve(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[readPdfFile] Error parsing PDF:', message, error);
        reject(new Error(`Failed to parse PDF: ${message}`));
      }
    };

    reader.onerror = () => {
      console.error('[readPdfFile] FileReader error');
      reject(new Error('Failed to read file'));
    };

    console.log('[readPdfFile] Reading file as ArrayBuffer');
    reader.readAsArrayBuffer(file);
  });
};

export const readPdfFromUrl = async (url: string): Promise<PdfTextContent> => {
  console.log('[readPdfFromUrl] Starting PDF read from URL');
  console.log('[readPdfFromUrl] URL:', url);
  
  try {
    const pdfjsLib = getPdfJsLib();
    console.log('[readPdfFromUrl] Loading PDF document from URL');
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    console.log('[readPdfFromUrl] PDF document loaded');
    const result = await extractTextFromPdf(pdf);
    console.log('[readPdfFromUrl] PDF read from URL completed successfully');
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[readPdfFromUrl] Error reading PDF from URL:', message, error);
    throw new Error(`Failed to parse PDF from URL: ${message}`);
  }
};

export const extractPdfMetadata = async (file: File): Promise<Record<string, any>> => {
  console.log('[extractPdfMetadata] Starting metadata extraction');
  console.log('[extractPdfMetadata] File name:', file.name);
  console.log('[extractPdfMetadata] File size:', file.size, 'bytes');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        console.log('[extractPdfMetadata] File read completed, extracting metadata');
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          console.error('[extractPdfMetadata] Failed to get array buffer');
          reject(new Error('Failed to read file'));
          return;
        }

        const pdfjsLib = getPdfJsLib();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        console.log('[extractPdfMetadata] Loading PDF document');
        const pdf = await loadingTask.promise;
        console.log('[extractPdfMetadata] PDF document loaded, pages:', pdf.numPages);
        const metadata = await pdf.getMetadata();

        const result = {
          numPages: pdf.numPages,
          info: metadata.info || {},
          metadata: metadata.metadata || {}
        };
        console.log('[extractPdfMetadata] Metadata extracted:', result);
        resolve(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[extractPdfMetadata] Error extracting metadata:', message, error);
        reject(new Error(`Failed to extract PDF metadata: ${message}`));
      }
    };

    reader.onerror = () => {
      console.error('[extractPdfMetadata] FileReader error');
      reject(new Error('Failed to read file'));
    };

    console.log('[extractPdfMetadata] Reading file as ArrayBuffer');
    reader.readAsArrayBuffer(file);
  });
};

