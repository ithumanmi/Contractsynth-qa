import { EInvoiceResult } from '../types';

const FILENAME_SANITIZE_REGEX = /[/\\:]/g;

export const exportEInvoiceXML = (result: EInvoiceResult): void => {
  const xmlData = result.xml;
  const blob = new Blob([xmlData], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const sanitized = result.metadata.invoiceNumber.replaceAll(FILENAME_SANITIZE_REGEX, '_');
  const filename = `EInvoice_${sanitized}_${Date.now()}.xml`;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportEInvoiceJSON = (result: EInvoiceResult): void => {
  const jsonData = JSON.stringify({
    invoiceNumber: result.metadata.invoiceNumber,
    invoiceDate: result.metadata.invoiceDate,
    approvalCode: result.approvalCode,
    approvalTime: result.approvalTime,
    status: result.status,
    error: result.error,
    caseId: result.metadata.caseId
  }, null, 2);
  
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const sanitized = result.metadata.invoiceNumber.replaceAll(FILENAME_SANITIZE_REGEX, '_');
  const filename = `EInvoice_${sanitized}_${Date.now()}.json`;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

