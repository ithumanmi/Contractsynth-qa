import { useState } from 'react';
import { GeneratorConfig, ParsedResponse, FakerData } from '../types';
import { generateFakerData } from '../services/simpleFaker';
import { generateFakerDataWithAI } from '../services/aiDataGenerator';
import { generateContractWithOpenAI } from '../services/openaiService';

export const useContractGenerator = () => {
  const [result, setResult] = useState<ParsedResponse | null>(null);
  const [fakerData, setFakerData] = useState<FakerData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (config: GeneratorConfig) => {
    setError(null);
    setIsGenerating(true);
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const baseUrl = process.env.OPENAI_BASE_URL;
      const model = process.env.OPENAI_MODEL || config.model;
      
      if (!apiKey) {
        throw new Error("Không tìm thấy API Key. Vui lòng thiết lập biến môi trường OPENAI_API_KEY.");
      }
      if (!baseUrl) {
        throw new Error("Không tìm thấy Base URL. Vui lòng thiết lập biến môi trường OPENAI_BASE_URL.");
      }

      let data: FakerData;
      try {
        data = await generateFakerDataWithAI(apiKey, baseUrl, model, config.seed);
      } catch (aiError: any) {
        console.warn("AI data generation failed, using fallback:", aiError);
        data = generateFakerData(Date.now());
      }
      
      setFakerData(data);

      const response = await generateContractWithOpenAI(
        apiKey,
        baseUrl,
        model,
        data,
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

  return { result, fakerData, isGenerating, error, generate, setError };
};

