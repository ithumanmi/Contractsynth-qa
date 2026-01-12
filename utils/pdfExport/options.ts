import { PdfMetadata, PdfExportOptions, Html2PdfWindow } from './types';
import { applyCloneStyles } from './applyCloneStyles';

const DEFAULT_MARGIN: [number, number, number, number] = [0, 20, 20, 20];
const DEFAULT_SCALE = 2;
const DEFAULT_QUALITY = 0.98;
const A4_WIDTH_MM = 210;
const A4_WIDTH_PX = 794;

export const createPdfOptions = (
  element: HTMLElement,
  options: PdfExportOptions
) => {
  const actualScrollHeight = element.scrollHeight || 0;
  const actualOffsetHeight = element.offsetHeight || 0;
  const actualClientHeight = element.clientHeight || 0;
  const scrollHeight = Math.max(actualScrollHeight, actualOffsetHeight, actualClientHeight, 1123);
  const margin = options.margin || DEFAULT_MARGIN;
  const scale = options.scale ?? DEFAULT_SCALE;
  const quality = options.quality ?? DEFAULT_QUALITY;

  console.log('[createPdfOptions] Element dimensions:', {
    scrollHeight: actualScrollHeight,
    offsetHeight: actualOffsetHeight,
    clientHeight: actualClientHeight,
    usedHeight: scrollHeight,
    htmlContent: element.innerHTML.length,
    computedDisplay: window.getComputedStyle(element).display,
    computedVisibility: window.getComputedStyle(element).visibility
  });

  const captureHeight = Math.max(scrollHeight, 2000);
  
  return {
    margin,
    filename: options.filename,
    image: { 
      type: 'png' as const, 
      quality: 1.0
    },
    html2canvas: { 
      scale,
      useCORS: true,
      logging: true,
      backgroundColor: '#ffffff',
      width: A4_WIDTH_PX,
      windowWidth: A4_WIDTH_PX,
      windowHeight: captureHeight,
      height: captureHeight,
      letterRendering: true,
      allowTaint: true,
      removeContainer: false,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15000,
      foreignObjectRendering: false,
      onclone: (clonedDoc: Document) => {
        console.log('[html2canvas onclone] Applying clone styles');
        applyCloneStyles(clonedDoc);
        
        const clonedContainer = clonedDoc.getElementById('pdf-export-container') as HTMLElement | null;
        if (clonedContainer) {
          const clonedScrollHeight = clonedContainer.scrollHeight || 0;
          const clonedOffsetHeight = clonedContainer.offsetHeight || 0;
          console.log('[html2canvas onclone] Cloned container innerHTML length:', clonedContainer.innerHTML.length);
          console.log('[html2canvas onclone] Cloned container scrollHeight:', clonedScrollHeight);
          console.log('[html2canvas onclone] Cloned container offsetHeight:', clonedOffsetHeight);
          console.log('[html2canvas onclone] Cloned container computed display:', clonedDoc.defaultView?.getComputedStyle(clonedContainer).display);
          console.log('[html2canvas onclone] Cloned container computed visibility:', clonedDoc.defaultView?.getComputedStyle(clonedContainer).visibility);
          
          const clonedPdfContent = clonedContainer.querySelector('.pdf-content') as HTMLElement | null;
          if (clonedPdfContent) {
            console.log('[html2canvas onclone] Cloned PDF content innerHTML length:', clonedPdfContent.innerHTML.length);
            console.log('[html2canvas onclone] Cloned PDF content computed display:', clonedDoc.defaultView?.getComputedStyle(clonedPdfContent).display);
            console.log('[html2canvas onclone] Cloned PDF content computed visibility:', clonedDoc.defaultView?.getComputedStyle(clonedPdfContent).visibility);
            console.log('[html2canvas onclone] Cloned PDF content computed opacity:', clonedDoc.defaultView?.getComputedStyle(clonedPdfContent).opacity);
            console.log('[html2canvas onclone] Cloned PDF content scrollHeight:', clonedPdfContent.scrollHeight);
            console.log('[html2canvas onclone] Cloned PDF content offsetHeight:', clonedPdfContent.offsetHeight);
            
                     const clonedTables = clonedContainer.querySelectorAll('.contract-table');
                     const clonedArticles = clonedContainer.querySelectorAll('.contract-article-header');
                     console.log('[html2canvas onclone] Cloned container has', clonedTables.length, 'tables and', clonedArticles.length, 'articles');
                     clonedArticles.forEach((article, idx) => {
                       const htmlEl = article as HTMLElement;
                       console.log('[html2canvas onclone] Article', idx + 1, ':', htmlEl.textContent?.substring(0, 60));
                       const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlEl);
                       console.log('[html2canvas onclone] Article', idx + 1, 'styles:', {
                         display: computedStyle?.display,
                         visibility: computedStyle?.visibility,
                         opacity: computedStyle?.opacity,
                         color: computedStyle?.color
                       });
                     });
            
            const actualContentHeight = Math.max(
              clonedScrollHeight,
              clonedOffsetHeight,
              clonedPdfContent?.scrollHeight || 0,
              clonedPdfContent?.offsetHeight || 0
            );
            
            clonedContainer.style.position = 'absolute';
            clonedContainer.style.top = '0';
            clonedContainer.style.left = '0';
            clonedContainer.style.width = '794px';
            clonedContainer.style.height = `${actualContentHeight}px`;
            clonedContainer.style.minHeight = `${actualContentHeight}px`;
            
            if (clonedPdfContent) {
              clonedPdfContent.style.height = 'auto';
              clonedPdfContent.style.width = '100%';
              clonedPdfContent.style.position = 'relative';
            }
            
            const allElements = clonedContainer.querySelectorAll('*');
            console.log('[html2canvas onclone] Total elements in container:', allElements.length);
            let visibleCount = 0;
            let hasTextContent = 0;
            allElements.forEach(el => {
              const htmlEl = el as HTMLElement;
              const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlEl);
              if (computedStyle && computedStyle.visibility !== 'hidden' && computedStyle.opacity !== '0') {
                visibleCount++;
              }
              if (htmlEl.textContent && htmlEl.textContent.trim().length > 0) {
                hasTextContent++;
              }
            });
            console.log('[html2canvas onclone] Visible elements:', visibleCount, 'out of', allElements.length);
            console.log('[html2canvas onclone] Elements with text content:', hasTextContent);
            
            const firstTextElement = Array.from(clonedContainer.querySelectorAll('*')).find(el => {
              const htmlEl = el as HTMLElement;
              return htmlEl.textContent && htmlEl.textContent.trim().length > 0;
            });
            if (firstTextElement) {
              const htmlEl = firstTextElement as HTMLElement;
              console.log('[html2canvas onclone] First text element:', htmlEl.tagName, htmlEl.className, 'text:', htmlEl.textContent?.substring(0, 50));
              const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlEl);
              console.log('[html2canvas onclone] First text element styles:', {
                display: computedStyle?.display,
                visibility: computedStyle?.visibility,
                opacity: computedStyle?.opacity,
                color: computedStyle?.color,
                fontSize: computedStyle?.fontSize
              });
            }
          }
        } else {
          console.error('[html2canvas onclone] Cloned container not found!');
        }
      }
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const,
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      precision: 16
    },
    pagebreak: { 
      mode: ['css', 'legacy'] as const 
    }
  };
};

export const isHtml2PdfAvailable = (): boolean => {
  const win = window as Html2PdfWindow;
  return typeof win.html2pdf !== 'undefined';
};

export const getHtml2Pdf = () => {
  const win = window as Html2PdfWindow;
  if (!win.html2pdf) {
    throw new Error('PDF library (html2pdf) is not loaded');
  }
  return win.html2pdf;
};

