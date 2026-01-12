import { useState } from 'react';
import { GeneratorConfig, ParsedResponse } from '../types';
import { generateFakerData } from '../services/simpleFaker';
import { generateContractWithOpenAI } from '../services/openaiService';

export const useContractGenerator = () => {
  const [result, setResult] = useState<ParsedResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (config: GeneratorConfig) => {
    setError(null);
    setIsGenerating(true);
    try {
      const fakerData = generateFakerData(config.seed);
      const apiKey = process.env.OPENAI_API_KEY;
      const baseUrl = process.env.OPENAI_BASE_URL;
      const model = process.env.OPENAI_MODEL || config.model;
      
      if (!apiKey) {
        throw new Error("Không tìm thấy API Key. Vui lòng thiết lập biến môi trường OPENAI_API_KEY.");
      }
      if (!baseUrl) {
        throw new Error("Không tìm thấy Base URL. Vui lòng thiết lập biến môi trường OPENAI_BASE_URL.");
      }

      const response = await generateContractWithOpenAI(
        apiKey,
        baseUrl,
        model,
        fakerData,
        config.activeMutations,
        config.contractType,
        config.locale
      );

      setResult(response);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không mong muốn trong quá trình tạo.");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { result, isGenerating, error, generate, setError };
};

