import { useState } from 'react';
import { BankStatementData, BankStatementConfig } from '../types/bankStatement';
import { FakerData } from '../types';
import { generateBankStatement } from '../services/bankStatementGenerator';

export const useBankStatementGenerator = () => {
  const [result, setResult] = useState<BankStatementData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (config: BankStatementConfig, contractData?: FakerData, seed?: number) => {
    setError(null);
    setIsGenerating(true);
    try {
      const statement = generateBankStatement(config, seed, contractData);
      setResult(statement);
    } catch (err: any) {
      setError(err.message || "Bank statement generation failed");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { result, isGenerating, error, generate, setError };
};

