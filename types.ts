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
  partyA: CompanyInfo;
  partyB: CompanyInfo;
  items: Array<{ description: string; qty: number; rate: number; total: number }>;
  totalAmount: number;
  vatRate: number;
  paymentPhases: PaymentPhase[];
}

export type InvoiceGenerationMode = 'C1' | 'C2' | 'C3' | 'C4';

export interface ReferenceConfig {
  includeContractNo: boolean;
  includeAddendumNo: boolean;
  customTokens?: string[];
}

export interface ConsolidationRules {
  sumAllAmounts: boolean;
  groupByServiceType: boolean;
  groupByPaymentPhase: boolean;
  customGrouping?: string;
}

export interface InvoiceGrouping {
  byAgreement: boolean;
  byDateRange: boolean;
  byServiceType: boolean;
  customRules?: string;
}

export interface EInvoiceConfig {
  invoiceSeries: string;
  templateCode: string;
  invoiceType: string;
  vatRate: number;
  currency: string;
  certificatePath?: string;
  certificatePassword?: string;
  gdtApiUrl?: string;
  gdtApiKey?: string;
  generationMode: InvoiceGenerationMode;
  selectedMilestones?: string[];
  selectedPaymentPhases?: number[];
  selectedContracts?: string[];
  selectedAgreements?: string[];
  dateRangeStart?: string;
  dateRangeEnd?: string;
  referenceConfig: ReferenceConfig;
  consolidationRules?: ConsolidationRules;
  invoiceGrouping?: InvoiceGrouping;
  invoicePerMilestone?: boolean;
  invoicePerPhase?: boolean;
  customMapping?: Array<{ agreementId: string; invoiceId: string }>;
  includeAuditTrail?: boolean;
  itemsPerInvoice?: number;
}

export interface EInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  seller: CompanyInfo;
  buyer: CompanyInfo;
  items: Array<{
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    vatRate: number;
    vatAmount: number;
    total: number;
  }>;
  summary: {
    totalBeforeVAT: number;
    totalVAT: number;
    totalPayable: number;
    amountInWords: string;
  };
  refTokens?: string[];
  linkedContractDocIds?: string[];
  linkedAgreementIds?: string[];
  auditTrail?: {
    contractNumbers: string[];
    addendumNumbers?: string[];
    milestoneNames?: string[];
    phaseNames?: string[];
  };
}

export interface EInvoiceResult {
  xml: string;
  approvalCode?: string;
  approvalTime?: string;
  status: 'generated' | 'submitted' | 'approved' | 'rejected';
  error?: string;
  metadata: {
    invoiceNumber: string;
    invoiceDate: string;
    caseId?: string;
  };
  invoices?: EInvoiceData[];
}
