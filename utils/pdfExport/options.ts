import { PdfMetadata, PdfExportOptions, Html2PdfWindow } from './types';
import { applyCloneStyles } from './styles';

const DEFAULT_MARGIN: [number, number, number, number] = [20, 20, 20, 20];
const DEFAULT_SCALE = 2;
const DEFAULT_QUALITY = 0.98;
const A4_WIDTH_MM = 210;
const A4_WIDTH_PX = 794;

export const createPdfOptions = (
  element: HTMLElement,
  options: PdfExportOptions
) => {
  const scrollHeight = element.scrollHeight || 1123;
  const margin = options.margin || DEFAULT_MARGIN;
  const scale = options.scale ?? DEFAULT_SCALE;
  const quality = options.quality ?? DEFAULT_QUALITY;

  return {
    margin,
    filename: options.filename,
    image: { 
      type: 'jpeg' as const, 
      quality 
    },
    html2canvas: { 
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: A4_WIDTH_PX,
      height: scrollHeight,
      windowWidth: A4_WIDTH_PX,
      windowHeight: scrollHeight,
      letterRendering: true,
      allowTaint: true,
      removeContainer: false,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: applyCloneStyles
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const,
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'] as const 
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

