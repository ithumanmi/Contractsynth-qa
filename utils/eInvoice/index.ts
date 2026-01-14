import { FakerData, EInvoiceConfig, EInvoiceResult, ParsedResponse } from '../../types';
import { mapContractToEInvoice, mapContractsToEInvoices } from './dataMapper';
import { generateEInvoiceXML } from './xmlGenerator';
import { signEInvoiceXML } from './digitalSignature';
import { submitToGDT } from '../../services/gdtApiClient';

export const generateEInvoice = async (
  fakerData: FakerData,
  config: EInvoiceConfig,
  parsedResponse?: ParsedResponse
): Promise<EInvoiceResult> => {
  let invoices;

  if (config.itemsPerInvoice && config.itemsPerInvoice > 0) {
    const itemsPerInvoice = config.itemsPerInvoice;
    const totalItems = fakerData.items.length;
    const invoiceCount = Math.ceil(totalItems / itemsPerInvoice);
    
    invoices = [];
    for (let i = 0; i < invoiceCount; i++) {
      const startIdx = i * itemsPerInvoice;
      const endIdx = Math.min(startIdx + itemsPerInvoice, totalItems);
      const invoiceItems = fakerData.items.slice(startIdx, endIdx);
      invoices.push(mapContractToEInvoice(fakerData, config, i, invoiceItems));
    }
  } else if (config.generationMode === 'C1' && (config.invoicePerPhase || config.invoicePerMilestone)) {
    if (config.invoicePerPhase && fakerData.paymentPhases) {
      const selectedPhases = config.selectedPaymentPhases || 
        fakerData.paymentPhases.map((_, idx) => idx);
      invoices = selectedPhases.map((phaseIdx, invoiceIdx) => {
        const phase = fakerData.paymentPhases[phaseIdx];
        const tempFakerData = {
          ...fakerData,
          items: fakerData.items.filter((_, idx) => idx === phaseIdx).length > 0 
            ? fakerData.items.filter((_, idx) => idx === phaseIdx)
            : [fakerData.items[0]]
        };
        return mapContractToEInvoice(tempFakerData, config, invoiceIdx);
      });
    } else {
      invoices = fakerData.items.map((_, idx) => 
        mapContractToEInvoice(fakerData, config, idx)
      );
    }
  } else {
    invoices = [mapContractToEInvoice(fakerData, config, 0)];
  }

  const primaryInvoice = invoices[0];
  const xml = generateEInvoiceXML(primaryInvoice, config);
  const signed = await signEInvoiceXML(xml);
  const gdtResult = await submitToGDT(signed.signedXml, config);

  return {
    xml: signed.signedXml,
    approvalCode: gdtResult.approvalCode,
    approvalTime: gdtResult.approvalTime,
    status: gdtResult.status,
    error: gdtResult.error,
    metadata: {
      invoiceNumber: primaryInvoice.invoiceNumber,
      invoiceDate: primaryInvoice.invoiceDate,
      caseId: parsedResponse?.caseId
    },
    invoices: invoices.length > 1 ? invoices : undefined
  };
};
