import { A4_WIDTH, A4_HEIGHT, PAGE_PADDING } from './pdfStyles';

export const CONTAINER_STYLES = `
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: ${A4_WIDTH};
  min-height: 100vh;
  padding: ${PAGE_PADDING};
  background: #ffffff;
  color: #000000;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  overflow: visible;
  z-index: -1;
`;

