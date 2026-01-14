import { BankStatementData } from '../types/bankStatement';

const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN').format(amount);
  }
  return amount.toFixed(2);
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

const getXLSX = () => {
  if (typeof window !== 'undefined' && (window as any).XLSX) {
    return (window as any).XLSX;
  }
  throw new Error('XLSX library not loaded');
};

export const exportBankStatementCSV = (data: BankStatementData): void => {
  const lines: string[] = [];
  
  lines.push(`Ngân hàng: ${data.account.bankName}`);
  lines.push(`Số tài khoản: ${data.account.accountNumber}`);
  lines.push(`Tên tài khoản: ${data.account.accountName}`);
  lines.push(`Chi nhánh: ${data.account.branch}`);
  lines.push(`Kỳ báo cáo: ${formatDate(data.statementPeriod.startDate)} - ${formatDate(data.statementPeriod.endDate)}`);
  lines.push('');
  lines.push('Ngày, Mô tả, Số tham chiếu, Ghi nợ, Ghi có, Số dư');
  
  lines.push(`Số dư đầu kỳ,,,,,${formatCurrency(data.openingBalance, data.account.currency)}`);
  
  data.transactions.forEach(tx => {
    lines.push([
      formatDate(tx.date),
      tx.description,
      tx.reference,
      tx.debit > 0 ? formatCurrency(tx.debit, data.account.currency) : '',
      tx.credit > 0 ? formatCurrency(tx.credit, data.account.currency) : '',
      formatCurrency(tx.balance, data.account.currency)
    ].join(','));
  });
  
  lines.push(`Số dư cuối kỳ,,,,,${formatCurrency(data.closingBalance, data.account.currency)}`);
  
  const csvContent = lines.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BankStatement_${data.account.accountNumber}_${data.statementPeriod.startDate}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportBankStatementJSON = (data: BankStatementData): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BankStatement_${data.account.accountNumber}_${data.statementPeriod.startDate}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const formatNumber = (num: number, currency: string = 'VND'): number => {
  if (currency === 'VND') {
    return num;
  }
  return parseFloat(num.toFixed(2));
};

export const exportBankStatementExcel = (data: BankStatementData): void => {
  try {
    const XLSX = getXLSX();
    const wb = XLSX.utils.book_new();
    
    const totalCredits = data.transactions.reduce((sum, tx) => sum + tx.credit, 0);
    const totalDebits = data.transactions.reduce((sum, tx) => sum + tx.debit, 0);
    const creditCount = data.transactions.filter(tx => tx.credit > 0).length;
    const debitCount = data.transactions.filter(tx => tx.debit > 0).length;
    
    const wsData: any[][] = [
      ['LỊCH SỬ GIAO DỊCH - TRANSACTION HISTORY'],
      ['VIETINBANK eFAST'],
      [],
      ['Account detail (Thông tin chi tiết tài khoản)'],
      [],
      ['Company name (Công ty):', data.account.accountName],
      ['Account No. (Số tài khoản):', data.account.accountNumber],
      ['Account type (Loại tài khoản):', data.account.accountType],
      ['Currency (Loại tiền tệ):', data.account.currency],
      ['Account Balance (Số dư hiện tại):', formatNumber(data.closingBalance, data.account.currency)],
      ['Available Balance (Số dư khả dụng):', formatNumber(data.closingBalance, data.account.currency)],
      ['Opening Balance (Số dư đầu kỳ):', formatNumber(data.openingBalance, data.account.currency)],
      ['Closing Balance (Số dư cuối kỳ):', formatNumber(data.closingBalance, data.account.currency)],
      ['From date - to date (Chu kỳ yêu cầu):', `${data.statementPeriod.startDate} - ${data.statementPeriod.endDate}`],
      [],
      ['Summary of Transactions within the period:'],
      ['Total credits (Tổng giá trị ghi có):', formatNumber(totalCredits, data.account.currency)],
      ['Total number of credit (Tổng số giao dịch ghi có):', creditCount],
      ['Total debits (Tổng giá trị ghi nợ):', formatNumber(totalDebits, data.account.currency)],
      ['Total number of debits (Tổng số giao dịch ghi nợ):', debitCount],
      [],
      ['Transaction history detail (Chi tiết lịch sử giao dịch)'],
      [],
      ['STT/No.', 'Ngày hạch toán/Accounting date', 'Mô tả giao dịch/ Transaction description', 'Nợ/ Debit', 'Có/ Credit', 'Số dư TK/ Account Balance', 'Số giao dịch/ Transaction number', 'Số tài khoản đối ứng/ Corresponsive account', 'Tên tài khoản đối ứng/ Corresponsive name', 'MTID/ CITAD', 'Mã định danh TK thụ hưởng/ To virtual account', 'Ngày phát sinh giao dịch/ Transaction date', 'Ngày hạch toán/ Posting date']
    ];
    
    data.transactions.forEach((tx, idx) => {
      wsData.push([
        idx + 1,
        formatDateTime(tx.postingDate || tx.date),
        tx.description,
        tx.debit > 0 ? formatNumber(tx.debit, data.account.currency) : 0,
        tx.credit > 0 ? formatNumber(tx.credit, data.account.currency) : 0,
        formatNumber(tx.balance, data.account.currency),
        tx.transactionNumber || '',
        tx.corresponsiveAccount || '',
        tx.corresponsiveName || '',
        tx.mtid || '',
        tx.virtualAccount || '',
        tx.transactionDate || tx.date,
        tx.postingDate || tx.date
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    ws['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 }
    ];
    
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    for (let row = 0; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;
        
        if (row === 0) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: 'center' }
          };
        } else if (row === 1) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 12 },
            alignment: { horizontal: 'center' }
          };
        } else if (row === 3 || row === 20) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 11 }
          };
        } else if (row === 22) {
          ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'D3D3D3' } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        } else if (row > 22 && (col === 3 || col === 4 || col === 5)) {
          ws[cellAddress].z = '#,##0.00';
        }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Transaction History');
    
    const filename = `BankStatement_${data.account.accountNumber}_${data.statementPeriod.startDate}.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch (error: any) {
    if (error.message.includes('XLSX library not loaded')) {
      alert('Excel export requires xlsx library. Please install: npm install xlsx');
    } else {
      alert('Excel export failed: ' + (error.message || 'Unknown error'));
    }
  }
};

