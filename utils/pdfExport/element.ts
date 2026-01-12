import { CONTAINER_STYLES } from './styles';

const CONTAINER_ID = 'pdf-export-container';

export const createPdfElement = (content: string): HTMLElement => {
  const existing = document.getElementById(CONTAINER_ID);
  if (existing) {
    existing.remove();
  }

  const element = document.createElement('div');
  element.id = CONTAINER_ID;
  element.style.cssText = CONTAINER_STYLES;
  element.innerHTML = content;
  
  return element;
};

export const getPdfContainer = (): HTMLElement | null => {
  return document.getElementById(CONTAINER_ID);
};

export const cleanupPdfElement = (element: HTMLElement): void => {
  if (element.parentNode) {
    document.body.removeChild(element);
  }
};

