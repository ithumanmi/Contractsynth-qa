import React, { useState, useEffect } from 'react';
import { BankStatementConfig } from '../types/bankStatement';
import { FakerData } from '../types';
import { useBankStatementGenerator } from '../hooks/useBankStatementGenerator';
import { exportBankStatementCSV, exportBankStatementJSON, exportBankStatementExcel } from '../utils/bankStatementExport';
import { Download, FileText, FileJson, Calendar, CreditCard, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface BankStatementPanelProps {
  contractData?: FakerData | null;
}

export const BankStatementPanel: React.FC<BankStatementPanelProps> = ({ contractData }) => {
  const [config, setConfig] = useState<BankStatementConfig>({
    accountNumber: contractData?.partyA.bankAccount || '',
    startDate: contractData ? (() => {
      const match = contractData.contractDate.match(/(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/);
      if (match) {
        const [, day, month, year] = match;
        const date = new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 2, Number.parseInt(day, 10));
        return date.toISOString().split('T')[0];
      }
      return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    })() : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: contractData?.paymentPhases && contractData.paymentPhases.length > 0 ? (() => {
      const lastPhase = contractData.paymentPhases[contractData.paymentPhases.length - 1];
      const match = lastPhase.dueDate.match(/(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/);
      if (match) {
        const [, day, month, year] = match;
        const date = new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1, Number.parseInt(day, 10));
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
      }
      return new Date().toISOString().split('T')[0];
    })() : new Date().toISOString().split('T')[0],
    transactionCount: 30,
    currency: 'VND',
    locale: 'vi_VN',
    format: 'csv',
    contractData: contractData || undefined
  });

  const { result, isGenerating, error, generate } = useBankStatementGenerator();

  useEffect(() => {
    if (contractData) {
      setConfig(prev => ({
        ...prev,
        accountNumber: contractData.partyA.bankAccount || prev.accountNumber,
        contractData: contractData
      }));
    }
  }, [contractData]);

  const handleGenerate = () => {
    const seed = contractData ? Date.now() : undefined;
    generate(config, contractData || undefined, seed);
  };

  const handleExportCSV = () => {
    if (result) {
      exportBankStatementCSV(result);
    }
  };

  const handleExportJSON = () => {
    if (result) {
      exportBankStatementJSON(result);
    }
  };

  const handleExportExcel = () => {
    if (result) {
      exportBankStatementExcel(result);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#FEFBF3] via-[#FFFBF0] to-[#F8F9FF]">
      <div className="p-6 border-b border-[#E8EAED]/50 bg-white/60 backdrop-blur-xl">
        <h2 className="text-2xl font-display font-bold text-[#2D3748] mb-2">Bank Statement Generator</h2>
        <p className="text-sm text-[#718096] font-medium">Generate synthetic bank statements</p>
      </div>

      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card-floating p-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-[#718096] uppercase tracking-wider mb-4 flex items-center">
              <CreditCard size={16} className="mr-2 text-[#6BD88A]" />
              Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2D3748] mb-2 flex items-center">
                  <CreditCard size={16} className="mr-2 text-[#7B8FFB]" />
                  Account Number
                </label>
                <input
                  type="text"
                  value={config.accountNumber}
                  onChange={(e) => setConfig({ ...config, accountNumber: e.target.value })}
                  placeholder="Auto-generated if empty"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2D3748] mb-2 flex items-center">
                    <Calendar size={16} className="mr-2 text-[#B896F7]" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2D3748] mb-2 flex items-center">
                    <Calendar size={16} className="mr-2 text-[#FF8CC8]" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={config.endDate}
                    onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="transactionCount" className="block text-sm font-semibold text-[#2D3748] mb-2">
                  Transaction Count
                </label>
                <input
                  id="transactionCount"
                  type="number"
                  value={config.transactionCount}
                  onChange={(e) => setConfig({ ...config, transactionCount: Number.parseInt(e.target.value, 10) || 30 })}
                  min="1"
                  max="1000"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-semibold text-[#2D3748] mb-2">
                  Currency
                </label>
                <select
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  className="input-field cursor-pointer"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="button-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    <span>Generate Bank Statement</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="card-floating p-6 border-2 border-[#FF6B9D] bg-gradient-to-r from-[#FF6B9D]/10 to-[#ED64A6]/10 animate-fadeIn">
              <p className="font-bold text-[#C53030]">Error</p>
              <p className="text-sm mt-1 text-[#C53030]">{error}</p>
            </div>
          )}

          {result && (
            <div className="card-floating p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-[#2D3748] mb-1">Bank Statement</h3>
                  <p className="text-sm text-[#718096] font-medium">
                    {result.account.bankName} - {result.account.accountNumber}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 bg-gradient-to-r from-[#6BD88A] to-[#48BB78] hover:from-[#48BB78] hover:to-[#38A169] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#6BD88A]/30 flex items-center space-x-2"
                  >
                    <FileSpreadsheet size={16} />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="button-primary px-4 py-2 flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 bg-white border-2 border-[#E8EAED] hover:border-[#7B8FFB] text-[#718096] hover:text-[#7B8FFB] rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center space-x-2"
                  >
                    <FileJson size={16} />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-4 mb-4 border-2 border-[#E8EAED] shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#718096] font-medium">Account Name:</span>
                    <span className="text-[#2D3748] ml-2 font-semibold">{result.account.accountName}</span>
                  </div>
                  <div>
                    <span className="text-[#718096] font-medium">Branch:</span>
                    <span className="text-[#2D3748] ml-2 font-semibold">{result.account.branch}</span>
                  </div>
                  <div>
                    <span className="text-[#718096] font-medium">Opening Balance:</span>
                    <span className="text-[#2D3748] ml-2 font-semibold">
                      {new Intl.NumberFormat('vi-VN').format(result.openingBalance)} {result.account.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#718096] font-medium">Closing Balance:</span>
                    <span className="text-[#6BD88A] ml-2 font-bold">
                      {new Intl.NumberFormat('vi-VN').format(result.closingBalance)} {result.account.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border-2 border-[#E8EAED] shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#E8EAED] bg-gradient-to-r from-white to-[#F8F9FF]">
                      <th className="text-left py-3 px-4 text-[#718096] font-bold">Date</th>
                      <th className="text-left py-3 px-4 text-[#718096] font-bold">Description</th>
                      <th className="text-left py-3 px-4 text-[#718096] font-bold">Reference</th>
                      <th className="text-right py-3 px-4 text-[#718096] font-bold">Debit</th>
                      <th className="text-right py-3 px-4 text-[#718096] font-bold">Credit</th>
                      <th className="text-right py-3 px-4 text-[#718096] font-bold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E8EAED] bg-[#F8F9FF]/50">
                      <td colSpan={3} className="py-2.5 px-4 text-[#718096] font-semibold">Opening Balance</td>
                      <td colSpan={2}></td>
                      <td className="text-right py-2.5 px-4 text-[#2D3748] font-bold">
                        {new Intl.NumberFormat('vi-VN').format(result.openingBalance)}
                      </td>
                    </tr>
                    {result.transactions.map((tx) => (
                      <tr key={`${tx.date}-${tx.reference}-${tx.transactionNumber}`} className="border-b border-[#E8EAED]/50 hover:bg-[#F8F9FF] transition-colors">
                        <td className="py-2.5 px-4 text-[#2D3748]">
                          {new Date(tx.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-2.5 px-4 text-[#2D3748] font-medium">{tx.description}</td>
                        <td className="py-2.5 px-4 text-[#718096] font-mono text-xs">{tx.reference}</td>
                        <td className="text-right py-2.5 px-4 text-[#FF6B9D] font-semibold">
                          {tx.debit > 0 ? new Intl.NumberFormat('vi-VN').format(tx.debit) : '-'}
                        </td>
                        <td className="text-right py-2.5 px-4 text-[#6BD88A] font-semibold">
                          {tx.credit > 0 ? new Intl.NumberFormat('vi-VN').format(tx.credit) : '-'}
                        </td>
                        <td className="text-right py-2.5 px-4 text-[#2D3748] font-bold">
                          {new Intl.NumberFormat('vi-VN').format(tx.balance)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-[#E8EAED] bg-gradient-to-r from-[#F8F9FF] to-white">
                      <td colSpan={3} className="py-2.5 px-4 text-[#718096] font-bold">Closing Balance</td>
                      <td colSpan={2}></td>
                      <td className="text-right py-2.5 px-4 text-[#6BD88A] font-bold text-lg">
                        {new Intl.NumberFormat('vi-VN').format(result.closingBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
