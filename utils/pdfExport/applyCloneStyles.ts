import { PDF_STYLES, A4_WIDTH } from './pdfStyles';

export function applyCloneStyles(doc: Document): void {
  console.log('[applyCloneStyles] Starting clone styles application');
  const container = doc.getElementById('pdf-export-container') as HTMLElement | null;
  if (!container) {
    console.warn('[applyCloneStyles] Container not found in cloned document');
    return;
  }
  console.log('[applyCloneStyles] Container found, innerHTML length:', container.innerHTML.length);
  console.log('[applyCloneStyles] Container initial dimensions:', {
    offsetWidth: container.offsetWidth,
    offsetHeight: container.offsetHeight,
    scrollWidth: container.scrollWidth,
    scrollHeight: container.scrollHeight
  });

  forceBaseLayout(doc, container);
  injectPdfStyles(doc);
  
  const pdfContent = container.querySelector('.pdf-content') as HTMLElement | null;
  if (pdfContent) {
    const textNodes = Array.from(pdfContent.childNodes).filter(node => 
      node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim().length > 0
    );
    console.log('[applyCloneStyles] PDF content has', textNodes.length, 'text nodes');
    if (textNodes.length > 0) {
      console.log('[applyCloneStyles] First text node preview:', textNodes[0].textContent?.substring(0, 50));
    }
  }
  
  console.log('[applyCloneStyles] Styles applied, final dimensions:', {
    offsetWidth: container.offsetWidth,
    offsetHeight: container.offsetHeight,
    scrollWidth: container.scrollWidth,
    scrollHeight: container.scrollHeight,
    innerHTMLLength: container.innerHTML.length
  });
}

function forceBaseLayout(doc: Document, container: HTMLElement) {
  container.style.setProperty('position', 'absolute', 'important');
  container.style.setProperty('top', '0', 'important');
  container.style.setProperty('left', '0', 'important');
  container.style.setProperty('width', A4_WIDTH, 'important');
  container.style.setProperty('height', 'auto', 'important');
  container.style.setProperty('min-height', 'auto', 'important');
  container.style.setProperty('max-height', 'none', 'important');
  container.style.setProperty('background-color', '#ffffff', 'important');
  container.style.setProperty('color', '#000000', 'important');
  container.style.setProperty('visibility', 'visible', 'important');
  container.style.setProperty('opacity', '1', 'important');
  container.style.setProperty('display', 'block', 'important');
  container.style.setProperty('margin', '0', 'important');
  container.style.setProperty('padding', '0', 'important');
  container.style.setProperty('overflow', 'visible', 'important');
  container.style.setProperty('pointer-events', 'auto', 'important');
  container.style.setProperty('font-family', '"Times New Roman", Arial, serif', 'important');
  container.style.setProperty('font-size', '11pt', 'important');
  container.style.setProperty('line-height', '1.5', 'important');
  container.style.setProperty('z-index', '9999', 'important');

  doc.body.style.setProperty('margin', '0', 'important');
  doc.body.style.setProperty('padding', '0', 'important');
  doc.body.style.setProperty('background-color', '#ffffff', 'important');
  doc.body.style.setProperty('width', A4_WIDTH, 'important');
  doc.body.style.setProperty('overflow', 'visible', 'important');
  doc.body.style.setProperty('position', 'relative', 'important');
  doc.body.style.setProperty('height', 'auto', 'important');
  doc.body.style.setProperty('min-height', `${container.scrollHeight + 100}px`, 'important');
  
  if (doc.documentElement) {
    doc.documentElement.style.setProperty('width', A4_WIDTH, 'important');
    doc.documentElement.style.setProperty('margin', '0', 'important');
    doc.documentElement.style.setProperty('padding', '0', 'important');
    doc.documentElement.style.setProperty('background-color', '#ffffff', 'important');
    doc.documentElement.style.setProperty('height', 'auto', 'important');
    doc.documentElement.style.setProperty('min-height', `${container.scrollHeight + 100}px`, 'important');
  }

  container.querySelectorAll('*').forEach(el => {
    (el as HTMLElement).style.setProperty('color', '#000000', 'important');
  });
  
  const pdfContent = container.querySelector('.pdf-content') as HTMLElement;
  if (pdfContent) {
    console.log('[forceBaseLayout] PDF content element found, innerHTML length:', pdfContent.innerHTML.length);
    pdfContent.style.setProperty('color', '#000000', 'important');
    pdfContent.style.setProperty('text-align', 'left', 'important');
    pdfContent.style.setProperty('width', '100%', 'important');
    pdfContent.style.setProperty('display', 'block', 'important');
    pdfContent.style.setProperty('visibility', 'visible', 'important');
    pdfContent.style.setProperty('opacity', '1', 'important');
    pdfContent.style.setProperty('position', 'relative', 'important');
    console.log('[forceBaseLayout] PDF content styles applied');
  } else {
    console.warn('[forceBaseLayout] PDF content element (.pdf-content) not found');
  }
  
  container.querySelectorAll('*').forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.setProperty('visibility', 'visible', 'important');
    htmlEl.style.setProperty('opacity', '1', 'important');
    if (htmlEl.tagName === 'DIV' || htmlEl.tagName === 'P' || htmlEl.tagName === 'SPAN') {
      htmlEl.style.setProperty('display', 'block', 'important');
    }
    htmlEl.style.setProperty('color', '#000000', 'important');
    htmlEl.style.setProperty('background-color', 'transparent', 'important');
  });
  
  const tables = container.querySelectorAll('.contract-table');
  console.log('[forceBaseLayout] Found', tables.length, 'tables in container');
  
  const articles = container.querySelectorAll('.contract-article-header');
  console.log('[forceBaseLayout] Found', articles.length, 'articles in container');
  articles.forEach((article, idx) => {
    const htmlEl = article as HTMLElement;
    console.log('[forceBaseLayout] Article', idx + 1, ':', htmlEl.textContent?.substring(0, 60));
    const computedStyle = doc.defaultView?.getComputedStyle(htmlEl);
    console.log('[forceBaseLayout] Article', idx + 1, 'styles:', {
      display: computedStyle?.display,
      visibility: computedStyle?.visibility,
      opacity: computedStyle?.opacity,
      color: computedStyle?.color,
      position: computedStyle?.position,
      zIndex: computedStyle?.zIndex
    });
    let nextEl = htmlEl.nextElementSibling;
    let itemCount = 0;
    while (nextEl && itemCount < 5) {
      if (nextEl.classList.contains('contract-item') || nextEl.classList.contains('contract-paragraph') || nextEl.classList.contains('contract-clause')) {
        itemCount++;
        const itemStyle = doc.defaultView?.getComputedStyle(nextEl as HTMLElement);
        console.log('[forceBaseLayout] Article', idx + 1, 'item', itemCount, ':', nextEl.className, 'text:', (nextEl as HTMLElement).textContent?.substring(0, 40), 'visible:', itemStyle?.visibility !== 'hidden');
      }
      nextEl = nextEl.nextElementSibling;
      if (nextEl?.classList.contains('contract-article-header') || nextEl?.classList.contains('contract-signature-container')) {
        break;
      }
    }
  });
  
  const signatures = container.querySelectorAll('.contract-signature-container, .contract-signature-a, .contract-signature-b');
  console.log('[forceBaseLayout] Found', signatures.length, 'signature elements in container');
}

function injectPdfStyles(doc: Document) {
  console.log('[injectPdfStyles] Injecting PDF styles, styles length:', PDF_STYLES.length);
  const styleTag = doc.createElement('style');
  styleTag.textContent = PDF_STYLES;
  doc.head.appendChild(styleTag);
  console.log('[injectPdfStyles] PDF styles injected');
}

