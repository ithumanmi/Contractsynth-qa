export const A4_WIDTH = '210mm';
export const A4_HEIGHT = '297mm';
export const PAGE_PADDING = '20mm';

export const BASE_FONT = `
  font-family: "Times New Roman", Arial, serif !important;
  font-size: 11pt !important;
  line-height: 1.5 !important;
  color: #000000 !important;
`;

export const PDF_STYLES = `
@page {
  size: A4 portrait;
  margin: 20mm;
  orphans: 2;
  widows: 2;
}

* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  box-sizing: border-box !important;
  max-height: none !important;
  overflow: visible !important;
}

div {
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

html, body {
  width: 794px !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #ffffff !important;
  overflow: visible !important;
  height: auto !important;
  max-height: none !important;
}

#pdf-export-container {
  position: relative !important;
  width: 794px !important;
  max-width: 794px !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #ffffff !important;
  font-family: "Times New Roman", "Times", serif !important;
  font-size: 11pt !important;
  line-height: 1.6 !important;
  color: #000000 !important;
  text-align: justify !important;
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.pdf-content {
  color: #000000 !important;
  text-align: left !important;
  width: 100% !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  font-family: "Times New Roman", "Times", serif !important;
  font-size: 11pt !important;
  line-height: 1.6 !important;
  max-width: 100% !important;
  word-wrap: break-word !important;
  margin: 0 !important;
  padding: 20mm !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.pdf-content h1 {
  font-size: 18pt !important;
  font-weight: bold !important;
  margin: 8px 0 6px !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.pdf-content h2 {
  font-size: 16pt !important;
  font-weight: bold !important;
  margin: 6px 0 4px !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.pdf-content h3 {
  font-size: 14pt !important;
  font-weight: bold !important;
  margin: 6px 0 3px !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.pdf-content p {
  margin: 2px 0 !important;
  line-height: 1.4 !important;
  word-break: break-word !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.pdf-content ul,
.pdf-content ol {
  margin: 4px 0 4px 20px !important;
  padding-left: 20px !important;
  line-height: 1.4 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.pdf-content li {
  margin: 2px 0 !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: list-item !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.pdf-content strong {
  font-weight: bold !important;
  color: #000000 !important;
}

.pdf-content em {
  font-style: italic !important;
}

.pdf-content pre {
  background: #f5f5f5 !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  padding: 8px !important;
  margin: 4px 0 !important;
  font-family: 'Courier New', monospace !important;
  font-size: 9pt !important;
  line-height: 1.3 !important;
  overflow-x: auto !important;
  white-space: pre-wrap !important;
  word-break: break-word !important;
  color: #000000 !important;
}

.contract-watermark {
  text-align: center !important;
  font-style: italic !important;
  color: #666666 !important;
  margin: 0 0 12px !important;
  font-size: 10pt !important;
  line-height: 1.5 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-national-header {
  text-align: center !important;
  font-weight: bold !important;
  font-size: 13pt !important;
  margin: 0 0 12px !important;
  line-height: 1.8 !important;
  letter-spacing: 0.3px !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-title-main {
  text-align: center !important;
  font-weight: bold !important;
  font-size: 16pt !important;
  text-transform: uppercase !important;
  margin: 18px 0 14px !important;
  letter-spacing: 1px !important;
  line-height: 1.5 !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-number-line {
  text-align: center !important;
  font-weight: bold !important;
  font-size: 12pt !important;
  margin: 12px 0 18px !important;
  line-height: 1.6 !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-can-cu {
  text-align: left !important;
  font-style: italic !important;
  font-size: 11pt !important;
  margin: 8px 0 12px !important;
  line-height: 1.6 !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-party-a,
.contract-party-b {
  margin: 1px 0 !important;
  line-height: 1.6 !important;
  font-size: 11pt !important;
  text-align: left !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-party-a {
  margin-top: 12px !important;
}

.contract-whereas {
  margin: 18px 0 !important;
  text-align: justify !important;
  line-height: 1.7 !important;
  font-size: 11pt !important;
  font-style: italic !important;
  text-indent: 0 !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-article-header {
  font-weight: bold !important;
  font-size: 13pt !important;
  margin: 20px 0 12px !important;
  text-transform: uppercase !important;
  line-height: 1.6 !important;
  page-break-after: avoid !important;
  page-break-before: auto !important;
  page-break-inside: avoid !important;
  color: #000000 !important;
  letter-spacing: 0.5px !important;
  text-align: left !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  position: relative !important;
  z-index: 2 !important;
  overflow: visible !important;
  max-height: none !important;
  height: auto !important;
}

.contract-clause {
  margin: 10px 0 10px 24px !important;
  text-align: justify !important;
  line-height: 1.7 !important;
  font-size: 11pt !important;
  text-indent: 0 !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-subclause {
  margin: 8px 0 8px 32px !important;
  text-align: justify !important;
  line-height: 1.7 !important;
  font-size: 11pt !important;
  text-indent: 0 !important;
  font-weight: bold !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-item {
  margin: 8px 0 8px 36px !important;
  text-align: justify !important;
  line-height: 1.7 !important;
  font-size: 11pt !important;
  text-indent: -18px !important;
  padding-left: 18px !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  position: relative !important;
  z-index: 2 !important;
  page-break-inside: avoid !important;
  overflow: visible !important;
}

.contract-paragraph {
  margin: 12px 0 !important;
  text-align: justify !important;
  line-height: 1.8 !important;
  font-size: 11pt !important;
  text-indent: 0 !important;
  orphans: 2 !important;
  widows: 2 !important;
  color: #000000 !important;
  word-spacing: 0.1em !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-spacing {
  height: 1px !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-table {
  margin: 18px 0 !important;
  width: 100% !important;
  border-collapse: collapse !important;
  border: 1px solid #333333 !important;
  page-break-inside: avoid !important;
  page-break-after: auto !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-table-row {
  display: flex !important;
  border-bottom: 1px solid #333333 !important;
  min-height: 32px !important;
  visibility: visible !important;
  opacity: 1 !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-table-row:last-child {
  border-bottom: none !important;
}

.contract-table-header {
  font-weight: bold !important;
  padding: 10px 8px !important;
  border-right: 1px solid #333333 !important;
  background-color: #f0f0f0 !important;
  text-align: center !important;
  font-size: 11pt !important;
  flex: 1 !important;
  vertical-align: middle !important;
  line-height: 1.5 !important;
  color: #000000 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.3px !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-table-header:last-child {
  border-right: none !important;
}

.contract-table-cell {
  padding: 10px 8px !important;
  border-right: 1px solid #333333 !important;
  font-size: 11pt !important;
  flex: 1 !important;
  text-align: left !important;
  vertical-align: middle !important;
  line-height: 1.6 !important;
  color: #000000 !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-table-cell:last-child {
  border-right: none !important;
}

.contract-signature-container {
  margin-top: 60px !important;
  margin-bottom: 20px !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  page-break-before: auto !important;
  page-break-inside: avoid !important;
  display: flex !important;
  justify-content: space-between !important;
  width: 100% !important;
  clear: both !important;
  position: relative !important;
  z-index: 1 !important;
  min-height: 80px !important;
  visibility: visible !important;
  opacity: 1 !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-signature-a,
.contract-signature-b {
  line-height: 1.8 !important;
  font-size: 11pt !important;
  flex: 0 0 48% !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

.contract-signature-a {
  text-align: left !important;
}

.contract-signature-b {
  text-align: right !important;
}
`;

