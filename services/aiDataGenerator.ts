import { FakerData } from '../types';

const AI_DATA_GENERATION_SYSTEM_PROMPT = `You are a data generator for Vietnamese business contracts. Generate realistic, DIVERSE Vietnamese company data, contract information, and financial details. 

IMPORTANT: Create UNIQUE data each time - different company names, different addresses, different services, different amounts. Vary everything creatively.

Return ONLY valid JSON matching this exact structure:
{
  "contractDate": "ngày [1-28] tháng [1-12] năm [2024-2025]",
  "contractNumber": "[2024-2025]/[1-12]/HĐDV-[unique suffix like ABC, XYZ, TECH, SOFT, etc]",
  "partyA": {
    "name": "CÔNG TY TNHH|CÔNG TY CỔ PHẦN|CÔNG TY TNHH MTV [creative company name]",
    "taxId": "0[9 random digits]",
    "address": "Số [1-500], Đường [Vietnamese street name], Quận [1-12]|TP. Thủ Đức|Quận Bình Thạnh, TP. Hồ Chí Minh",
    "phone": "+84 [9xx] [6-7 digits]",
    "representative": "[Vietnamese full name: Last + Middle + First]",
    "position": "Giám đốc|Tổng giám đốc|Chủ tịch HĐQT",
    "bankName": "Ngân hàng TMCP [Vietcombank|Techcombank|MB Bank|ACB|VPBank|BIDV|Sacombank|VIB]",
    "bankAccount": "[10 random digits]"
  },
  "partyB": {
    "name": "CÔNG TY TNHH|CÔNG TY CỔ PHẦN|CÔNG TY TNHH MTV [creative company name - DIFFERENT from partyA]",
    "taxId": "0[9 random digits - DIFFERENT from partyA]",
    "address": "Số [1-500], Đường [Vietnamese street name - DIFFERENT from partyA], Quận [Hoàn Kiếm|Ba Đình|Cầu Giấy|Đống Đa|Hai Bà Trưng], Hà Nội",
    "phone": "+84 [9xx] [6-7 digits - DIFFERENT from partyA]",
    "representative": "[Vietnamese full name - DIFFERENT from partyA]",
    "position": "Giám đốc|Tổng giám đốc|Chủ tịch HĐQT",
    "bankName": "Ngân hàng TMCP [Vietcombank|Techcombank|MB Bank|ACB|VPBank|BIDV|Sacombank|VIB - can be same or different]",
    "bankAccount": "[10 random digits - DIFFERENT from partyA]"
  },
  "items": [
    {
      "description": "[Creative Vietnamese service description - vary between: software development, consulting, cloud services, marketing, design, maintenance, training, etc. Create 2-5 unique items]",
      "qty": [1-50],
      "rate": [500000-100000000],
      "total": qty * rate
    }
  ],
  "totalAmount": [sum of all items.total],
  "vatRate": 8 or 10,
  "paymentPhases": [
    {
      "phaseName": "Đợt 1|Đợt 2|Đợt 3|Đợt [N] (Nghiệm thu)",
      "amount": [distribute totalAmount across 2-4 phases, last phase is remainder],
      "dueDate": "ngày [1-28] tháng [1-12] năm [2024-2025]",
      "conditions": "[Vietnamese payment condition text - vary each phase]"
    }
  ]
}

CRITICAL: Each generation must be COMPLETELY DIFFERENT from previous ones. Vary company names, services, amounts, dates, addresses, everything!`;

export const generateFakerDataWithAI = async (
  apiKey: string,
  baseUrl: string,
  model: string,
  seed: number
): Promise<FakerData> => {
  if (!apiKey) throw new Error("Thiếu API Key");

  const userPrompt = `Generate DIVERSE and UNIQUE Vietnamese contract data. Seed: ${seed} (use this for variation, not repetition). 

Create COMPLETELY DIFFERENT data from any previous generation:
- Unique, creative company names (not generic)
- Different street addresses and districts
- Varied service descriptions (2-5 items)
- Different amounts and quantities
- Different payment phases and dates
- Vary VAT rates appropriately

Make it realistic but fresh and unique every time. Return ONLY the JSON object, no other text.`;

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
            content: AI_DATA_GENERATION_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.9,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    if (!content) {
      throw new Error("Không nhận được dữ liệu từ API");
    }

    const jsonData = typeof content === 'string' ? JSON.parse(content) : content;
    
    const paymentPhases = jsonData.paymentPhases || [];
    const totalPhasesAmount = paymentPhases.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const totalItemsAmount = (jsonData.items || []).reduce((sum: number, i: any) => sum + (i.total || i.qty * i.rate || 0), 0);
    
    if (Math.abs(totalPhasesAmount - totalItemsAmount) > 1000) {
      const adjustedPhases = paymentPhases.map((phase: any, idx: number) => {
        if (idx === paymentPhases.length - 1) {
          return { ...phase, amount: totalItemsAmount - totalPhasesAmount + phase.amount };
        }
        return phase;
      });
      jsonData.paymentPhases = adjustedPhases;
    }

    jsonData.totalAmount = totalItemsAmount;

    return jsonData as FakerData;

  } catch (error: any) {
    console.error("AI Data Generation Error", error);
    throw new Error(`Lỗi tạo dữ liệu: ${error.message}`);
  }
};

