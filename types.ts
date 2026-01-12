export enum MutationCode {
  E01 = "E01",
  E02 = "E02",
  E03 = "E03",
  E04 = "E04",
  E05 = "E05",
  E06 = "E06",
  E10 = "E10",
  E15 = "E15",
  E20 = "E20",
  E21 = "E21"
}

export interface MutationDef {
  code: MutationCode;
  name: string;
  description: string;
  category: 'Formatting' | 'Logic' | 'Content';
}

export interface GeneratorConfig {
  seed: number;
  contractType: string;
  locale: string;
  activeMutations: MutationCode[];
  model: string;
}

export interface ParsedResponse {
  caseId: string;
  varsJson: Record<string, any>;
  truthIntendedJson: Record<string, any>;
  anomalies: { code: string; description: string }[];
  observedText: string;
  passCriteria: string[];
}

export interface CompanyInfo {
  name: string;
  taxId: string;
  address: string;
  phone: string;
  representative: string;
  position: string;
  bankName: string;
  bankAccount: string;
}

export interface PaymentPhase {
  phaseName: string;
  amount: number;
  dueDate: string;
  conditions: string;
}

export interface FakerData {
  contractDate: string;
  contractNumber: string;
  partyA: CompanyInfo; // Service Provider
  partyB: CompanyInfo; // Client
  items: Array<{ description: string; qty: number; rate: number; total: number }>;
  totalAmount: number;
  paymentPhases: PaymentPhase[]; // For E21 Multi-phase payment
}
