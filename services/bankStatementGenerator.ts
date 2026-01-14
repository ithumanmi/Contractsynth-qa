import { BankStatementData, BankStatementConfig, BankTransaction, BankAccount } from '../types/bankStatement';
import { FakerData } from '../types';

const generateAccountNumber = (seed: number): string => {
  const rng = (s: number) => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let s = seed;
  let num = '';
  for (let i = 0; i < 12; i++) {
    num += Math.floor(rng(s++) * 10);
  }
  return num;
};

const generateBankName = (seed: number): string => {
  const banks = ['Vietcombank', 'Techcombank', 'MB Bank', 'ACB', 'VPBank', 'BIDV', 'Agribank', 'Sacombank'];
  const rng = (s: number) => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return banks[Math.floor(rng(seed) * banks.length)];
};

const generateTransactionDescriptions = (): string[] => {
  return [
    'CHUYEN KHOAN DEN',
    'THANH TOAN HOA DON',
    'PHI DICH VU',
    'LAI TIET KIEM',
    'RUT TIEN ATM',
    'NAP TIEN DIEN THOAI',
    'THANH TOAN THE',
    'CHUYEN KHOAN TU',
    'PHI QUAN LY',
    'HOAN TIEN',
    'THU NO',
    'THANH TOAN LUONG',
    'CHI TRA HOP DONG',
    'PHI GIAO DICH',
    'THANH TOAN VAT'
  ];
};

const generateReference = (index: number): string => {
  const prefix = 'FT';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(index).padStart(6, '0');
  return `${prefix}${date}${seq}`;
};

const calculateBalance = (openingBalance: number, transactions: BankTransaction[]): number => {
  return transactions.reduce((balance, tx) => {
    return balance + tx.credit - tx.debit;
  }, openingBalance);
};

const parseContractDate = (dateStr: string): Date => {
  const match = dateStr.match(/(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1, Number.parseInt(day, 10));
  }
  return new Date();
};

const parsePhaseDate = (dateStr: string): Date => {
  const match = dateStr.match(/(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1, Number.parseInt(day, 10));
  }
  return new Date();
};

export const generateBankStatement = (
  config: BankStatementConfig,
  seed: number = Date.now(),
  contractData?: FakerData
): BankStatementData => {
  const rng = (s: number) => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let s = seed;

  let account: BankAccount;
  let transactions: BankTransaction[] = [];
  let openingBalance: number;
  let startDate: Date;
  let endDate: Date;

  if (contractData) {
    account = {
      accountNumber: contractData.partyA.bankAccount || generateAccountNumber(seed),
      accountName: contractData.partyA.name,
      bankName: contractData.partyA.bankName,
      branch: contractData.partyA.address.split(',')[contractData.partyA.address.split(',').length - 2] || 'Chi nhánh 1',
      currency: config.currency || 'VND',
      accountType: 'Tài khoản thanh toán'
    };

    const contractDate = parseContractDate(contractData.contractDate);
    startDate = new Date(contractDate);
    startDate.setMonth(startDate.getMonth() - 1);
    
    endDate = new Date(contractDate);
    if (contractData.paymentPhases && contractData.paymentPhases.length > 0) {
      const lastPhase = contractData.paymentPhases[contractData.paymentPhases.length - 1];
      const lastPhaseDate = parsePhaseDate(lastPhase.dueDate);
      endDate = lastPhaseDate > endDate ? lastPhaseDate : endDate;
    }
    endDate.setDate(endDate.getDate() + 7);

    openingBalance = Math.floor(rng(s++) * 50000000) + contractData.totalAmount;
    let currentBalance = openingBalance;

    if (contractData.paymentPhases && contractData.paymentPhases.length > 0) {
      contractData.paymentPhases.forEach((phase, idx) => {
        const phaseDate = parsePhaseDate(phase.dueDate);
        const vatAmount = Math.round(phase.amount * contractData.vatRate / 100);
        const totalWithVAT = phase.amount + vatAmount;
        
        currentBalance += totalWithVAT;
        
        const txDateTime = new Date(phaseDate);
        txDateTime.setHours(9 + Math.floor(rng(s++) * 8));
        txDateTime.setMinutes(Math.floor(rng(s++) * 60));
        txDateTime.setSeconds(Math.floor(rng(s++) * 60));
        
        transactions.push({
          date: phaseDate.toISOString().split('T')[0],
          description: `Thanh toán ${phase.phaseName} theo Hợp đồng số ${contractData.contractNumber}`,
          reference: generateReference(idx + 1),
          debit: 0,
          credit: totalWithVAT,
          balance: currentBalance,
          transactionNumber: String(idx + 1),
          corresponsiveAccount: contractData.partyB.bankAccount,
          corresponsiveName: contractData.partyB.name,
          mtid: `MTID${String(Math.floor(rng(s++) * 1000000)).padStart(6, '0')}`,
          virtualAccount: '',
          transactionDate: txDateTime.toISOString().split('T')[0],
          postingDate: phaseDate.toISOString().split('T')[0]
        });
      });
    } else {
      const vatAmount = Math.round(contractData.totalAmount * contractData.vatRate / 100);
      const totalWithVAT = contractData.totalAmount + vatAmount;
      
      currentBalance += totalWithVAT;
      const txDate = new Date(contractDate);
      txDate.setDate(txDate.getDate() + 7);
      
      transactions.push({
        date: txDate.toISOString().split('T')[0],
        description: `Thanh toán theo Hợp đồng số ${contractData.contractNumber}`,
        reference: generateReference(1),
        debit: 0,
        credit: totalWithVAT,
        balance: currentBalance,
        transactionNumber: '1',
        corresponsiveAccount: contractData.partyB.bankAccount,
        corresponsiveName: contractData.partyB.name,
        mtid: `MTID${String(Math.floor(rng(s++) * 1000000)).padStart(6, '0')}`,
        virtualAccount: '',
        transactionDate: txDate.toISOString().split('T')[0],
        postingDate: txDate.toISOString().split('T')[0]
      });
    }

    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const additionalTxCount = Math.min(10, Math.max(3, Math.floor(daysDiff / 5)));
    const descriptions = generateTransactionDescriptions();
    
    for (let i = 0; i < additionalTxCount; i++) {
      const dayOffset = Math.floor(rng(s++) * daysDiff);
      const txDate = new Date(startDate);
      txDate.setDate(txDate.getDate() + dayOffset);
      
      const isCredit = rng(s++) > 0.3;
      const amount = Math.floor(rng(s++) * 20000000) + 50000;
      const description = descriptions[Math.floor(rng(s++) * descriptions.length)];
      const reference = generateReference(transactions.length + i + 1);
      
      const txNumber = String(transactions.length + i + 1);
      const corrAccount = isCredit ? contractData.partyB.bankAccount : generateAccountNumber(seed + i);
      const corrName = isCredit ? contractData.partyB.name : '';
      const mtid = `MTID${String(Math.floor(rng(s++) * 1000000)).padStart(6, '0')}`;
      const virtualAccount = '';
      const txDateTime = new Date(txDate);
      txDateTime.setHours(Math.floor(rng(s++) * 24));
      txDateTime.setMinutes(Math.floor(rng(s++) * 60));
      txDateTime.setSeconds(Math.floor(rng(s++) * 60));
      
      if (isCredit) {
        currentBalance += amount;
        transactions.push({
          date: txDate.toISOString().split('T')[0],
          description,
          reference,
          debit: 0,
          credit: amount,
          balance: currentBalance,
          transactionNumber: txNumber,
          corresponsiveAccount: corrAccount,
          corresponsiveName: corrName,
          mtid,
          virtualAccount,
          transactionDate: txDateTime.toISOString().split('T')[0],
          postingDate: txDate.toISOString().split('T')[0]
        });
      } else {
        currentBalance -= amount;
        transactions.push({
          date: txDate.toISOString().split('T')[0],
          description,
          reference,
          debit: amount,
          credit: 0,
          balance: currentBalance,
          transactionNumber: txNumber,
          corresponsiveAccount: corrAccount,
          corresponsiveName: corrName,
          mtid,
          virtualAccount,
          transactionDate: txDateTime.toISOString().split('T')[0],
          postingDate: txDate.toISOString().split('T')[0]
        });
      }
    }
  } else {
    const accountNumber = config.accountNumber || generateAccountNumber(seed);
    const bankName = generateBankName(seed);
    const accountName = `NGUYEN VAN ${String.fromCharCode(65 + Math.floor(rng(s++) * 26))}`;
    const branch = `Chi nhanh ${Math.floor(rng(s++) * 10) + 1}`;
    
    account = {
      accountNumber,
      accountName,
      bankName: `Ngân hàng TMCP ${bankName}`,
      branch,
      currency: config.currency || 'VND',
      accountType: 'Tài khoản thanh toán'
    };

    startDate = new Date(config.startDate);
    endDate = new Date(config.endDate);
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const transactionCount = config.transactionCount || Math.min(50, Math.max(10, daysDiff));
    const descriptions = generateTransactionDescriptions();
    
    openingBalance = Math.floor(rng(s++) * 100000000) + 10000000;
    let currentBalance = openingBalance;
    
    for (let i = 0; i < transactionCount; i++) {
      const dayOffset = Math.floor(rng(s++) * daysDiff);
      const txDate = new Date(startDate);
      txDate.setDate(txDate.getDate() + dayOffset);
      
      const isCredit = rng(s++) > 0.4;
      const amount = Math.floor(rng(s++) * 50000000) + 100000;
      const description = descriptions[Math.floor(rng(s++) * descriptions.length)];
      const reference = generateReference(i + 1);
      
      const txNumber = String(Math.floor(rng(s++) * 1000) + 1);
      const corrAccount = Math.random() > 0.5 ? generateAccountNumber(seed + i) : '';
      const corrName = corrAccount ? `NGUYEN VAN ${String.fromCharCode(65 + Math.floor(rng(s++) * 26))}` : '';
      const mtid = `MTID${String(Math.floor(rng(s++) * 1000000)).padStart(6, '0')}`;
      const virtualAccount = Math.random() > 0.7 ? generateAccountNumber(seed + i + 1000) : '';
      const txDateTime = new Date(txDate);
      txDateTime.setHours(Math.floor(rng(s++) * 24));
      txDateTime.setMinutes(Math.floor(rng(s++) * 60));
      txDateTime.setSeconds(Math.floor(rng(s++) * 60));
      
      if (isCredit) {
        currentBalance += amount;
        transactions.push({
          date: txDate.toISOString().split('T')[0],
          description,
          reference,
          debit: 0,
          credit: amount,
          balance: currentBalance,
          transactionNumber: txNumber,
          corresponsiveAccount: corrAccount,
          corresponsiveName: corrName,
          mtid,
          virtualAccount,
          transactionDate: txDateTime.toISOString().split('T')[0],
          postingDate: txDate.toISOString().split('T')[0]
        });
      } else {
        currentBalance -= amount;
        transactions.push({
          date: txDate.toISOString().split('T')[0],
          description,
          reference,
          debit: amount,
          credit: 0,
          balance: currentBalance,
          transactionNumber: txNumber,
          corresponsiveAccount: corrAccount,
          corresponsiveName: corrName,
          mtid,
          virtualAccount,
          transactionDate: txDateTime.toISOString().split('T')[0],
          postingDate: txDate.toISOString().split('T')[0]
        });
      }
    }
  }
  
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const closingBalance = transactions.length > 0 
    ? transactions[transactions.length - 1].balance 
    : openingBalance;

  return {
    account,
    statementPeriod: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    },
    openingBalance,
    closingBalance,
    transactions,
    metadata: {
      statementNumber: `STMT-${new Date().getFullYear()}-${String(Math.floor(rng(s++) * 10000)).padStart(4, '0')}`,
      generatedDate: new Date().toISOString().split('T')[0]
    }
  };
};

