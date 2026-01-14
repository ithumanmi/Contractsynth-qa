export interface BankAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  branch: string;
  currency: string;
  accountType: string;
}

export interface BankTransaction {
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  transactionNumber?: string;
  corresponsiveAccount?: string;
  corresponsiveName?: string;
  mtid?: string;
  virtualAccount?: string;
  transactionDate?: string;
  postingDate?: string;
}

export interface BankStatementData {
  account: BankAccount;
  statementPeriod: {
    startDate: string;
    endDate: string;
  };
  openingBalance: number;
  closingBalance: number;
  transactions: BankTransaction[];
  metadata?: {
    statementNumber: string;
    generatedDate: string;
    pageNumber?: number;
    totalPages?: number;
  };
}

export interface BankStatementConfig {
  accountNumber: string;
  startDate: string;
  endDate: string;
  transactionCount: number;
  currency: string;
  locale: string;
  format: 'excel' | 'csv' | 'pdf';
  contractData?: any;
}

