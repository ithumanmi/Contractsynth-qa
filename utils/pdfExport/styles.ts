export const PDF_STYLES = `
  @page {
    size: A4 portrait;
    margin: 20mm;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  html, body {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 210mm !important;
    overflow: visible !important;
  }
  #pdf-export-container {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
    color: #000000 !important;
    background-color: #ffffff !important;
    width: 210mm !important;
    margin: 0 !important;
    padding: 20mm !important;
    font-family: Arial, sans-serif !important;
    font-size: 11pt !important;
    line-height: 1.5 !important;
  }
  .pdf-content {
    color: #000000 !important;
  }
  .pdf-content h1 {
    font-size: 18pt !important;
    font-weight: bold !important;
    margin: 15px 0 10px 0 !important;
    color: #000000 !important;
  }
  .pdf-content h2 {
    font-size: 16pt !important;
    font-weight: bold !important;
    margin: 12px 0 8px 0 !important;
    color: #000000 !important;
  }
  .pdf-content h3 {
    font-size: 14pt !important;
    font-weight: bold !important;
    margin: 10px 0 6px 0 !important;
    color: #000000 !important;
  }
  .pdf-content p {
    margin: 6px 0 !important;
    line-height: 1.5 !important;
    color: #000000 !important;
  }
  .pdf-content ul, .pdf-content ol {
    margin: 8px 0 8px 20px !important;
    padding-left: 20px !important;
    line-height: 1.5 !important;
  }
  .pdf-content li {
    margin: 4px 0 !important;
    color: #000000 !important;
  }
  .pdf-content strong {
    font-weight: bold !important;
    color: #000000 !important;
  }
  .pdf-content em {
    font-style: italic !important;
  }
`;

export const CONTAINER_STYLES = `
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  background: #ffffff;
  color: #000000;
  font-family: Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  z-index: -1;
  overflow: visible;
  box-sizing: border-box;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
`;

export const applyCloneStyles = (clonedDoc: Document): void => {
  const clonedElement = clonedDoc.getElementById('pdf-export-container');
  if (!clonedElement) return;

  const htmlEl = clonedElement as HTMLElement;
  htmlEl.style.position = 'relative';
  htmlEl.style.top = '0';
  htmlEl.style.left = '0';
  htmlEl.style.transform = 'none';
  htmlEl.style.width = '210mm';
  htmlEl.style.backgroundColor = '#ffffff';
  htmlEl.style.color = '#000000';
  htmlEl.style.visibility = 'visible';
  htmlEl.style.opacity = '1';
  htmlEl.style.display = 'block';
  htmlEl.style.margin = '0';
  htmlEl.style.padding = '25mm';
  htmlEl.style.pointerEvents = 'auto';
  
  const body = clonedDoc.body;
  body.style.margin = '0';
  body.style.padding = '0';
  body.style.backgroundColor = '#ffffff';
  body.style.width = '210mm';
  body.style.overflow = 'visible';
  
  const allTextElements = clonedElement.querySelectorAll('*');
  allTextElements.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.setProperty('color', '#000000', 'important');
  });
  
  const style = clonedDoc.createElement('style');
  style.textContent = PDF_STYLES;
  clonedDoc.head.appendChild(style);
};

