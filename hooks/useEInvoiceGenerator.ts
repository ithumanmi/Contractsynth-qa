import { useState } from 'react';
import { EInvoiceConfig, EInvoiceResult, FakerData, ParsedResponse } from '../types';
import { generateEInvoice } from '../utils/eInvoice';

export const useEInvoiceGenerator = () => {
  const [result, setResult] = useState<EInvoiceResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    fakerData: FakerData,
    config: EInvoiceConfig,
    parsedResponse?: ParsedResponse
  ) => {
    setError(null);
    setIsGenerating(true);
    try {
      const invoiceResult = await generateEInvoice(fakerData, config, parsedResponse);
      setResult(invoiceResult);
    } catch (err: any) {
      setError(err.message || "E-Invoice generation failed");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { result, isGenerating, error, generate, setError };
};

