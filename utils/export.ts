import { ParsedResponse } from '../types';
import {
  buildPdfContent,
  createPdfElement,
  cleanupPdfElement,
  getPdfContainer,
  createPdfOptions,
  isHtml2PdfAvailable,
  getHtml2Pdf
} from './pdfExport/index';
import type { PdfMetadata } from './pdfExport/index';

const RENDER_DELAY_MS = 2000;
const DOWNLOAD_DELAY_MS = 100;
const FILENAME_SANITIZE_REGEX = /[\/\\:]/g;

export const exportJson = (data: ParsedResponse): void => {
  const jsonData = JSON.stringify({
    caseId: data.caseId,
    varsJson: data.varsJson,
    truthIntendedJson: data.truthIntendedJson,
    anomalies: data.anomalies,
    passCriteria: data.passCriteria
  }, null, 2);
  
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ContractSynth_${data.caseId.replace(FILENAME_SANITIZE_REGEX, '_')}_${Date.now()}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const downloadPdfBlob = (blob: Blob, filename: string): void => {
  if (!blob || blob.size === 0) {
    throw new Error('PDF blob is empty or invalid');
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  link.style.position = 'absolute';
  link.style.left = '-9999px';
  
  document.body.appendChild(link);
  
  setTimeout(() => {
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, DOWNLOAD_DELAY_MS);
  }, DOWNLOAD_DELAY_MS);
};

const generateFilename = (caseId: string): string => {
  const sanitizedCaseId = caseId.replace(FILENAME_SANITIZE_REGEX, '_');
  return `ContractSynth_${sanitizedCaseId}_${Date.now()}.pdf`;
};

const waitForElementRender = (): Promise<void> => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, RENDER_DELAY_MS);
      });
    });
  });
};

export const exportPdf = async (
  data: ParsedResponse,
  metadata?: PdfMetadata
): Promise<void> => {
  if (!data.observedText) {
    throw new Error('No observed text to export');
  }

  const content = buildPdfContent(data);
  if (!content) {
    throw new Error('Failed to build PDF content');
  }

  const element = createPdfElement(content);
  document.body.appendChild(element);

  try {
    await waitForElementRender();

    const container = getPdfContainer();
    if (!container) {
      throw new Error('PDF container element not found in DOM');
    }

    if (!isHtml2PdfAvailable()) {
      throw new Error('PDF library (html2pdf) is not loaded');
    }

    const filename = generateFilename(data.caseId);
    const options = createPdfOptions(container, {
      filename,
      metadata
    });

    const html2pdf = getHtml2Pdf();
    const worker = html2pdf().set(options).from(container);
    
    const blob = await worker.outputPdf('blob');
    downloadPdfBlob(blob, filename);
  } catch (error) {
    throw error;
  } finally {
    cleanupPdfElement(element);
  }
};
