import { FakerData, EInvoiceData, EInvoiceConfig } from '../../types';

const numberToWords = (num: number): string => {
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  const hundreds = ['', 'một trăm', 'hai trăm', 'ba trăm', 'bốn trăm', 'năm trăm', 'sáu trăm', 'bảy trăm', 'tám trăm', 'chín trăm'];

  if (num === 0) return 'không đồng chẵn';

  const billions = Math.floor(num / 1000000000);
  const millions = Math.floor((num % 1000000000) / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;

  const convertThreeDigits = (n: number): string => {
    if (n === 0) return '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;

    let result = '';
    if (h > 0) result += hundreds[h] + ' ';
    if (t > 1) {
      result += tens[t];
      if (o > 0) result += ' ' + ones[o];
      result += ' ';
    } else if (t === 1) {
      result += 'mười';
      if (o > 0) result += ' ' + ones[o];
      result += ' ';
    } else if (o > 0) {
      result += ones[o] + ' ';
    }

    return result.trim();
  };

  let words = '';
  if (billions > 0) {
    words += convertThreeDigits(billions) + ' tỷ ';
  }
  if (millions > 0) {
    words += convertThreeDigits(millions) + ' triệu ';
  }
  if (thousands > 0) {
    words += convertThreeDigits(thousands) + ' nghìn ';
  }
  if (remainder > 0) {
    words += convertThreeDigits(remainder);
  }

  return words.trim().replace(/\s+/g, ', ') + ' đồng chẵn';
};

const generateInvoiceNumber = (contractNumber: string, index: number = 0): string => {
  const padded = String(index + 1).padStart(7, '0');
  return padded;
};

const buildRefTokens = (fakerData: FakerData, config: EInvoiceConfig): string[] => {
  const tokens: string[] = [];
  if (config.referenceConfig.includeContractNo) {
    tokens.push(fakerData.contractNumber);
  }
  if (config.referenceConfig.includeAddendumNo) {
    const addendumNo = `PL-${fakerData.contractNumber}`;
    tokens.push(addendumNo);
  }
  if (config.referenceConfig.customTokens) {
    tokens.push(...config.referenceConfig.customTokens);
  }
  return tokens;
};

const buildItemDescription = (
  item: { description: string; qty: number; rate: number; total: number },
  fakerData: FakerData,
  config: EInvoiceConfig,
  phaseIndex?: number
): string => {
  let description = item.description;
  const refTokens = buildRefTokens(fakerData, config);
  const refText = refTokens.length > 0 ? ` theo ${refTokens.join(', ')}` : '';

  if (config.generationMode === 'C1' && fakerData.paymentPhases && phaseIndex !== undefined) {
    const phase = fakerData.paymentPhases[phaseIndex];
    if (phase) {
      return `${phase.phaseName} ${description}${refText}`;
    }
  }

  if (config.generationMode === 'C2' || config.generationMode === 'C3') {
    if (refTokens.length > 1) {
      return `${description} (${refTokens.join(', ')})`;
    }
  }

  return `${description}${refText}`;
};

export const mapContractToEInvoice = (
  fakerData: FakerData,
  config: EInvoiceConfig,
  invoiceIndex: number = 0,
  itemsToInclude?: Array<{ description: string; qty: number; rate: number; total: number }>
): EInvoiceData => {
  const invoiceNumber = generateInvoiceNumber(fakerData.contractNumber, invoiceIndex);
  const vatRate = config.vatRate;
  const refTokens = buildRefTokens(fakerData, config);
  const sourceItems = itemsToInclude || fakerData.items;

  let items: EInvoiceData['items'] = [];
  const auditTrail = {
    contractNumbers: [fakerData.contractNumber],
    phaseNames: [] as string[]
  };

  if (config.itemsPerInvoice && config.itemsPerInvoice > 0 && !itemsToInclude) {
    const itemsPerInvoice = config.itemsPerInvoice;
    const startIdx = invoiceIndex * itemsPerInvoice;
    const endIdx = Math.min(startIdx + itemsPerInvoice, fakerData.items.length);
    const invoiceItems = fakerData.items.slice(startIdx, endIdx);
    
    invoiceItems.forEach((item, idx) => {
      const amount = item.total;
      const vatAmount = Math.round(amount * vatRate / 100);
      const total = amount + vatAmount;
      
      items.push({
        name: buildItemDescription(item, fakerData, config, startIdx + idx),
        unit: 'Package',
        quantity: item.qty,
        unitPrice: item.rate,
        amount: amount,
        vatRate: vatRate,
        vatAmount: vatAmount,
        total: total
      });
    });
  } else if (config.generationMode === 'C1') {
    if (config.invoicePerPhase && fakerData.paymentPhases) {
      const selectedPhases = config.selectedPaymentPhases || 
        fakerData.paymentPhases.map((_, idx) => idx);
      
      selectedPhases.forEach((phaseIdx) => {
        const phase = fakerData.paymentPhases[phaseIdx];
        const item = sourceItems[phaseIdx] || sourceItems[0];
        if (item && phase) {
          const amount = phase.amount || item.total;
          const vatAmount = Math.round(amount * vatRate / 100);
          const total = amount + vatAmount;
          
          items.push({
            name: buildItemDescription(item, fakerData, config, phaseIdx),
            unit: 'Package',
            quantity: item.qty,
            unitPrice: item.rate,
            amount: amount,
            vatRate: vatRate,
            vatAmount: vatAmount,
            total: total
          });
          
          auditTrail.phaseNames.push(phase.phaseName);
        }
      });
    } else if (config.invoicePerMilestone) {
      sourceItems.forEach((item, idx) => {
        const amount = item.total;
        const vatAmount = Math.round(amount * vatRate / 100);
        const total = amount + vatAmount;
        
        items.push({
          name: buildItemDescription(item, fakerData, config, idx),
          unit: 'Package',
          quantity: item.qty,
          unitPrice: item.rate,
          amount: amount,
          vatRate: vatRate,
          vatAmount: vatAmount,
          total: total
        });
      });
    } else {
      sourceItems.forEach((item, idx) => {
        const amount = item.total;
        const vatAmount = Math.round(amount * vatRate / 100);
        const total = amount + vatAmount;
        
        items.push({
          name: buildItemDescription(item, fakerData, config, idx),
          unit: 'Package',
          quantity: item.qty,
          unitPrice: item.rate,
          amount: amount,
          vatRate: vatRate,
          vatAmount: vatAmount,
          total: total
        });
      });
    }
  } else if (config.generationMode === 'C2') {
    if (config.consolidationRules?.groupByServiceType) {
      const grouped = sourceItems.reduce((acc, item) => {
        const key = item.description;
        if (!acc[key]) {
          acc[key] = { ...item, total: 0 };
        }
        acc[key].total += item.total;
        return acc;
      }, {} as Record<string, typeof fakerData.items[0] & { total: number }>);

      Object.values(grouped).forEach((item) => {
        const amount = item.total;
        const vatAmount = Math.round(amount * vatRate / 100);
        const total = amount + vatAmount;
        
        items.push({
          name: buildItemDescription(item, fakerData, config),
          unit: 'Package',
          quantity: item.qty,
          unitPrice: item.rate,
          amount: amount,
          vatRate: vatRate,
          vatAmount: vatAmount,
          total: total
        });
      });
    } else {
      sourceItems.forEach((item) => {
        const amount = item.total;
        const vatAmount = Math.round(amount * vatRate / 100);
        const total = amount + vatAmount;
        
        items.push({
          name: buildItemDescription(item, fakerData, config),
          unit: 'Package',
          quantity: item.qty,
          unitPrice: item.rate,
          amount: amount,
          vatRate: vatRate,
          vatAmount: vatAmount,
          total: total
        });
      });
    }
  } else {
    sourceItems.forEach((item, idx) => {
      const amount = item.total;
      const vatAmount = Math.round(amount * vatRate / 100);
      const total = amount + vatAmount;
      
      items.push({
        name: buildItemDescription(item, fakerData, config, idx),
        unit: 'Package',
        quantity: item.qty,
        unitPrice: item.rate,
        amount: amount,
        vatRate: vatRate,
        vatAmount: vatAmount,
        total: total
      });
    });
  }

  const totalBeforeVAT = items.reduce((sum, item) => sum + item.amount, 0);
  const totalVAT = items.reduce((sum, item) => sum + item.vatAmount, 0);
  const totalPayable = totalBeforeVAT + totalVAT;
  const amountInWords = numberToWords(totalPayable);

  const invoiceData: EInvoiceData = {
    invoiceNumber,
    invoiceDate: fakerData.contractDate,
    seller: fakerData.partyA,
    buyer: fakerData.partyB,
    items,
    summary: {
      totalBeforeVAT,
      totalVAT,
      totalPayable,
      amountInWords
    },
    refTokens: refTokens.length > 0 ? refTokens : undefined,
    linkedContractDocIds: config.generationMode === 'C2' ? [fakerData.contractNumber] : undefined,
    linkedAgreementIds: (config.generationMode === 'C3' || config.generationMode === 'C4') ? [fakerData.contractNumber] : undefined
  };

  if (config.includeAuditTrail) {
    invoiceData.auditTrail = auditTrail;
  }

  return invoiceData;
};

export const mapContractsToEInvoices = (
  contracts: FakerData[],
  config: EInvoiceConfig
): EInvoiceData[] => {
  if (config.generationMode === 'C2') {
    const consolidated = contracts.reduce((acc, contract) => {
      const invoice = mapContractToEInvoice(contract, config, 0);
      acc.items.push(...invoice.items);
      acc.summary.totalBeforeVAT += invoice.summary.totalBeforeVAT;
      acc.summary.totalVAT += invoice.summary.totalVAT;
      acc.summary.totalPayable += invoice.summary.totalPayable;
      if (invoice.refTokens) {
        acc.refTokens = [...(acc.refTokens || []), ...invoice.refTokens];
      }
      if (invoice.linkedContractDocIds) {
        acc.linkedContractDocIds = [...(acc.linkedContractDocIds || []), ...invoice.linkedContractDocIds];
      }
      return acc;
    }, {
      invoiceNumber: generateInvoiceNumber(contracts[0]?.contractNumber || 'CONSOLIDATED', 0),
      invoiceDate: contracts[0]?.contractDate || new Date().toISOString(),
      seller: contracts[0]?.partyA || {} as any,
      buyer: contracts[0]?.partyB || {} as any,
      items: [] as EInvoiceData['items'],
      summary: {
        totalBeforeVAT: 0,
        totalVAT: 0,
        totalPayable: 0,
        amountInWords: ''
      }
    } as Partial<EInvoiceData>);

    consolidated.summary.amountInWords = numberToWords(consolidated.summary.totalPayable);
    return [consolidated as EInvoiceData];
  }

  if (config.generationMode === 'C4' && config.invoiceGrouping?.byAgreement) {
    return contracts.map((contract, idx) => mapContractToEInvoice(contract, config, idx));
  }

  return [mapContractToEInvoice(contracts[0] || {} as FakerData, config, 0)];
};
