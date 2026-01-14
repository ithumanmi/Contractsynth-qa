import { EInvoiceConfig, EInvoiceResult } from '../types';

export interface GDTSubmissionResult {
  approvalCode?: string;
  approvalTime?: string;
  status: 'approved' | 'rejected';
  error?: string;
  message?: string;
}

export const submitToGDT = async (
  signedXml: string,
  config: EInvoiceConfig
): Promise<GDTSubmissionResult> => {
  if (!config.gdtApiUrl) {
    return {
      status: 'approved',
      approvalCode: 'MOCK-GDT-' + Date.now(),
      approvalTime: new Date().toISOString()
    };
  }

  try {
    const response = await fetch(`${config.gdtApiUrl}/api/invoice/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': `Bearer ${config.gdtApiKey || ''}`
      },
      body: signedXml
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: 'rejected',
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    const result = await response.json();
    return {
      status: result.status === 'approved' ? 'approved' : 'rejected',
      approvalCode: result.approvalCode,
      approvalTime: result.approvalTime,
      error: result.error,
      message: result.message
    };
  } catch (error: any) {
    return {
      status: 'rejected',
      error: error.message || 'Network error'
    };
  }
};

export const generateEInvoiceResult = (
  xml: string,
  gdtResult: GDTSubmissionResult,
  metadata: { invoiceNumber: string; invoiceDate: string; caseId?: string }
): EInvoiceResult => {
  let status: EInvoiceResult['status'] = 'generated';
  if (gdtResult.status === 'approved') {
    status = 'approved';
  } else if (gdtResult.status === 'rejected') {
    status = 'rejected';
  } else if (gdtResult.approvalCode) {
    status = 'submitted';
  }

  let finalXml = xml;
  if (gdtResult.approvalCode) {
    finalXml = finalXml
      .replace('<ApprovalCode></ApprovalCode>', `<ApprovalCode>${gdtResult.approvalCode}</ApprovalCode>`)
      .replace('<ApprovalTime></ApprovalTime>', `<ApprovalTime>${gdtResult.approvalTime || new Date().toISOString()}</ApprovalTime>`);
  }

  return {
    xml: finalXml,
    approvalCode: gdtResult.approvalCode,
    approvalTime: gdtResult.approvalTime,
    status,
    error: gdtResult.error,
    metadata
  };
};

