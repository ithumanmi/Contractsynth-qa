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
import { logger } from './logger';

const RENDER_DELAY_MS = 2000;
const DOWNLOAD_DELAY_MS = 100;
const FILENAME_SANITIZE_REGEX = /[/\\:]/g;

export const exportJson = (data: ParsedResponse): void => {
  console.log('[exportJson] Starting JSON export');
  console.log('[exportJson] Case ID:', data.caseId);
  console.log('[exportJson] Anomalies count:', data.anomalies?.length || 0);
  
  const jsonData = JSON.stringify({
    caseId: data.caseId,
    varsJson: data.varsJson,
    truthIntendedJson: data.truthIntendedJson,
    anomalies: data.anomalies,
    passCriteria: data.passCriteria
  }, null, 2);
  
  console.log('[exportJson] JSON data size:', jsonData.length, 'bytes');
  
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `ContractSynth_${data.caseId.replaceAll(FILENAME_SANITIZE_REGEX, '_')}_${Date.now()}.json`;
  link.download = filename;
  
  console.log('[exportJson] Downloading file:', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  console.log('[exportJson] JSON export completed');
};

const downloadPdfBlob = (blob: Blob, filename: string): void => {
  console.log('[downloadPdfBlob] Starting download');
  console.log('[downloadPdfBlob] Blob size:', blob.size, 'bytes');
  console.log('[downloadPdfBlob] Filename:', filename);
  
  if (!blob || blob.size === 0) {
    console.error('[downloadPdfBlob] Invalid blob:', { blobSize: blob?.size });
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
  
  const cleanup = () => {
    try {
      if (link.parentNode) {
        link.remove();
      }
      URL.revokeObjectURL(url);
      console.log('[downloadPdfBlob] Temporary blob URL revoked and link removed');
    } catch (error) {
      console.error('[downloadPdfBlob] Error during cleanup:', error);
    }
  };
  
  setTimeout(() => {
    console.log('[downloadPdfBlob] Triggering download');
    link.click();
    setTimeout(() => {
      cleanup();
      console.log('[downloadPdfBlob] Download completed and cleaned up');
    }, DOWNLOAD_DELAY_MS);
  }, DOWNLOAD_DELAY_MS);
};

const generateFilename = (caseId: string): string => {
  const sanitizedCaseId = caseId.replaceAll(FILENAME_SANITIZE_REGEX, '_');
  const filename = `ContractSynth_${sanitizedCaseId}_${Date.now()}.pdf`;
  console.log('[generateFilename] Generated filename:', filename);
  return filename;
};

const waitForElementRender = (): Promise<void> => {
  console.log('[waitForElementRender] Waiting for element render, delay:', RENDER_DELAY_MS, 'ms');
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          console.log('[waitForElementRender] Render delay completed');
          resolve();
        }, RENDER_DELAY_MS);
      });
    });
  });
};

export const exportPdf = async (
  data: ParsedResponse,
  metadata?: PdfMetadata
): Promise<void> => {
  console.log('[exportPdf] Starting PDF export');
  console.log('[exportPdf] Case ID:', data.caseId);
  console.log('[exportPdf] Has observedText:', !!data.observedText);
  
  if (!data.observedText) {
    console.error('[exportPdf] No observed text to export');
    throw new Error('No observed text to export');
  }

  console.log('[exportPdf] observedText length:', data.observedText.length);
  
  let originalStyles: { position: string; top: string; left: string; visibility: string; opacity: string; zIndex: string; width: string } | null = null;
  const content = buildPdfContent(data);
  console.log('[exportPdf] Built content length:', content?.length || 0);
  
  if (!content) {
    console.error('[exportPdf] Failed to build PDF content');
    throw new Error('Failed to build PDF content');
  }

  const element = createPdfElement(content);
  element.style.position = 'fixed';
  element.style.top = '-9999px';
  element.style.left = '-9999px';
  element.style.visibility = 'hidden';
  element.style.opacity = '0';
  element.style.pointerEvents = 'none';
  element.style.zIndex = '-1';
  document.body.appendChild(element);

  try {
    console.log('[exportPdf] Waiting for element render');
    await waitForElementRender();

    console.log('[exportPdf] Getting PDF container');
    const container = getPdfContainer();
    if (!container) {
      console.error('[exportPdf] PDF container not found');
      throw new Error('PDF container element not found in DOM');
    }
    
    originalStyles = {
      position: container.style.position,
      top: container.style.top,
      left: container.style.left,
      visibility: container.style.visibility,
      opacity: container.style.opacity,
      zIndex: container.style.zIndex,
      width: container.style.width
    };
    
     container.style.setProperty('position', 'absolute', 'important');
     container.style.setProperty('top', '0', 'important');
     container.style.setProperty('left', '0', 'important');
     container.style.setProperty('visibility', 'visible', 'important');
     container.style.setProperty('opacity', '1', 'important');
     container.style.setProperty('pointer-events', 'auto', 'important');
     container.style.setProperty('z-index', '9999', 'important');
     container.style.setProperty('width', '794px', 'important');
     container.style.setProperty('background-color', '#ffffff', 'important');
     
     const pdfContentEl = container.querySelector('.pdf-content') as HTMLElement | null;
     if (pdfContentEl) {
       pdfContentEl.style.setProperty('color', '#000000', 'important');
       pdfContentEl.style.setProperty('visibility', 'visible', 'important');
       pdfContentEl.style.setProperty('opacity', '1', 'important');
     }
     
     container.querySelectorAll('*').forEach(el => {
       const htmlEl = el as HTMLElement;
       htmlEl.style.setProperty('color', '#000000', 'important');
       htmlEl.style.setProperty('visibility', 'visible', 'important');
       htmlEl.style.setProperty('opacity', '1', 'important');
     });
     
     await new Promise(resolve => {
       requestAnimationFrame(() => {
         requestAnimationFrame(() => {
           setTimeout(resolve, 200);
         });
       });
     });
    
    console.log('[exportPdf] PDF container made visible for capture');
    console.log('[exportPdf] Container scrollHeight:', container.scrollHeight);
    console.log('[exportPdf] Container offsetHeight:', container.offsetHeight);
    console.log('[exportPdf] Container clientHeight:', container.clientHeight);
    console.log('[exportPdf] Container innerHTML length:', container.innerHTML.length);
    console.log('[exportPdf] Container computed style display:', window.getComputedStyle(container).display);
    console.log('[exportPdf] Container computed style visibility:', window.getComputedStyle(container).visibility);
    console.log('[exportPdf] Container computed style opacity:', window.getComputedStyle(container).opacity);
    const pdfContent = container.querySelector('.pdf-content');
    if (pdfContent) {
      console.log('[exportPdf] PDF content element found, innerHTML length:', pdfContent.innerHTML.length);
      console.log('[exportPdf] PDF content computed style display:', window.getComputedStyle(pdfContent as HTMLElement).display);
    } else {
      console.warn('[exportPdf] PDF content element (.pdf-content) not found!');
    }

    console.log('[exportPdf] Checking html2pdf availability');
    if (!isHtml2PdfAvailable()) {
      console.error('[exportPdf] html2pdf library not available');
      throw new Error('PDF library (html2pdf) is not loaded');
    }
    console.log('[exportPdf] html2pdf library available');

    const filename = generateFilename(data.caseId);
    console.log('[exportPdf] Creating PDF options');
    const options = createPdfOptions(container, {
      filename,
      metadata
    });

    console.log('[exportPdf] Generating PDF blob');
    const html2pdf = getHtml2Pdf();
    console.log('[exportPdf] html2pdf function obtained');
    console.log('[exportPdf] Creating html2pdf worker with options:', {
      margin: options.margin,
      filename: options.filename,
      html2canvas: {
        scale: options.html2canvas?.scale,
        width: options.html2canvas?.width,
        height: options.html2canvas?.height,
        windowHeight: options.html2canvas?.windowHeight
      },
      jsPDF: {
        format: options.jsPDF?.format,
        orientation: options.jsPDF?.orientation
      }
    });
    const worker = html2pdf().set(options).from(container);
    console.log('[exportPdf] Worker created, starting PDF generation...');
    const startTime = Date.now();
    const blob = await worker.outputPdf('blob');
    const endTime = Date.now();
    console.log('[exportPdf] PDF blob generated, size:', blob.size, 'bytes, time:', (endTime - startTime), 'ms');
    console.log('[exportPdf] PDF blob type:', blob.type);
    
    try {
      downloadPdfBlob(blob, filename);
      console.log('[exportPdf] PDF export completed successfully');
    } finally {
      console.log('[exportPdf] Cleaning up PDF blob reference');
    }
  } catch (error) {
    console.error('[exportPdf] Error during PDF export:', error);
    throw error;
    } finally {
      console.log('[exportPdf] Cleaning up PDF element');
      const finalContainer = getPdfContainer();
      if (finalContainer && originalStyles) {
        finalContainer.style.position = originalStyles.position;
        finalContainer.style.top = originalStyles.top;
        finalContainer.style.left = originalStyles.left;
        finalContainer.style.visibility = originalStyles.visibility;
        finalContainer.style.opacity = originalStyles.opacity;
        finalContainer.style.zIndex = originalStyles.zIndex;
        finalContainer.style.width = originalStyles.width;
        console.log('[exportPdf] Container styles restored');
      }
      cleanupPdfElement(element);
    }
};
