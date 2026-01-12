import { SYSTEM_INSTRUCTION, MUTATIONS } from '../constants';
import { generateCaseId } from '../utils/constants';
import { FakerData, ParsedResponse, MutationCode } from '../types';

const extractBlock = (text: string, startTag: string, endTag: string): string => {
  const startIndex = text.indexOf(startTag);
  if (startIndex === -1) return "";
  const contentStart = startIndex + startTag.length;
  const endIndex = text.indexOf(endTag, contentStart);
  if (endIndex === -1) return "";
  return text.substring(contentStart, endIndex).trim();
};

export const parseOpenAIResponse = (text: string): ParsedResponse => {
  try {
    const caseId = extractBlock(text, "---CASE_START---", "\n").replace("case_id:", "").trim();
    const varsJsonStr = extractBlock(text, "---VARS_JSON---", "---END VARS_JSON---");
    const truthJsonStr = extractBlock(text, "---TRUTH_INTENDED_JSON---", "---END TRUTH_INTENDED_JSON---");
    const anomaliesJsonStr = extractBlock(text, "---TEXT_OBSERVED_ANOMALIES_JSON---", "---END TEXT_OBSERVED_ANOMALIES_JSON---");
    const observedText = extractBlock(text, "---OBSERVED_TEXT_MD---", "---END OBSERVED_TEXT_MD---");
    const passCriteriaStr = extractBlock(text, "---PASS_CRITERIA---", "---END PASS_CRITERIA---");

    const anomaliesObj = JSON.parse(anomaliesJsonStr || '{"anomalies": []}');

    return {
      caseId: caseId || generateCaseId(),
      varsJson: JSON.parse(varsJsonStr || "{}"),
      truthIntendedJson: JSON.parse(truthJsonStr || "{}"),
      anomalies: anomaliesObj.anomalies || [],
      observedText: observedText,
      passCriteria: passCriteriaStr.split('\n').filter(line => line.trim().startsWith('-')).map(l => l.replace('-', '').trim())
    };
  } catch (error) {
    console.error("Failed to parse OpenAI response structure", error);
    throw new Error("Lỗi định dạng đầu ra từ AI. Vui lòng thử lại.");
  }
};

const buildMutationDetails = (mutations: MutationCode[]): string => {
  return mutations.length > 0 
    ? mutations.map(code => {
        const def = MUTATIONS.find(m => m.code === code);
        return def ? `- ${code}: ${def.name} (${def.description})` : `- ${code}`;
      }).join("\n")
    : "Không có (Clean Case)";
};

const buildUserPrompt = (
  contractType: string,
  locale: string,
  contractNumber: string,
  fakerData: FakerData,
  mutationDetails: string
): string => {
  return `
    TẠO CASE MỚI:
    Loại hợp đồng: ${contractType}
    Khu vực: ${locale} (Việt Nam)
    Số hợp đồng: ${contractNumber}
    
    DỮ LIỆU ĐẦU VÀO (VARS_JSON - Nguồn sự thật):
    ${JSON.stringify(fakerData, null, 2)}
    
    YÊU CẦU MUTATIONS (Áp dụng các lỗi sau vào văn bản OBSERVED_TEXT):
    ${mutationDetails}
    
    Thực hiện ngay.
  `;
};

export const generateContractWithOpenAI = async (
  apiKey: string,
  baseUrl: string,
  model: string,
  fakerData: FakerData,
  mutations: MutationCode[],
  contractType: string,
  locale: string
): Promise<ParsedResponse> => {
  if (!apiKey) throw new Error("Thiếu API Key");

  const mutationDetails = buildMutationDetails(mutations);
  const userPrompt = buildUserPrompt(contractType, locale, fakerData.contractNumber, fakerData, mutationDetails);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_INSTRUCTION
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    
    if (!text) {
      throw new Error("Không nhận được phản hồi từ API");
    }

    return parseOpenAIResponse(text);

  } catch (error: any) {
    console.error("OpenAI API Error", error);
    throw error;
  }
};
