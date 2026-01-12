import { CONTAINER_STYLES } from './pdfContainer';

const CONTAINER_ID = 'pdf-export-container';

export const createPdfElement = (content: string): HTMLElement => {
  console.log('[createPdfElement] Creating PDF element');
  console.log('[createPdfElement] Content length:', content.length);
  const existing = document.getElementById(CONTAINER_ID);
  if (existing) {
    console.log('[createPdfElement] Removing existing container');
    existing.remove();
  }

  const element = document.createElement('div');
  element.id = CONTAINER_ID;
  element.style.cssText = CONTAINER_STYLES;
  element.innerHTML = content;
  element.style.position = 'fixed';
  element.style.top = '-9999px';
  element.style.left = '-9999px';
  element.style.visibility = 'hidden';
  element.style.opacity = '0';
  element.style.pointerEvents = 'none';
  element.style.zIndex = '-1';
  console.log('[createPdfElement] Element created, innerHTML length:', element.innerHTML.length);
  console.log('[createPdfElement] Element dimensions:', {
    offsetWidth: element.offsetWidth,
    offsetHeight: element.offsetHeight,
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight
  });
  
  return element;
};

export const getPdfContainer = (): HTMLElement | null => {
  const container = document.getElementById(CONTAINER_ID);
  if (container) {
    console.log('[getPdfContainer] Container found');
    console.log('[getPdfContainer] Container dimensions:', {
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight,
      scrollWidth: container.scrollWidth,
      scrollHeight: container.scrollHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight,
      innerHTML: container.innerHTML.length
    });
  } else {
    console.warn('[getPdfContainer] Container not found');
  }
  return container;
};

export const cleanupPdfElement = (element: HTMLElement): void => {
  console.log('[cleanupPdfElement] Cleaning up PDF element');
  if (element.parentNode) {
    document.body.removeChild(element);
    console.log('[cleanupPdfElement] Element removed from DOM');
  } else {
    console.log('[cleanupPdfElement] Element has no parent, skipping removal');
  }
};

