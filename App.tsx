import React, { useState } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { ResultDashboard } from './components/ResultDashboard';
import { BankStatementPanel } from './components/BankStatementPanel';
import { EInvoicePanel } from './components/EInvoicePanel';
import { GeneratorConfig } from './types';
import { useContractGenerator } from './hooks/useContractGenerator';
import { ShieldAlert, Sparkles, FileText, CreditCard, Receipt, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'contract' | 'bankStatement' | 'einvoice'>('contract');
  const [config, setConfig] = useState<GeneratorConfig>({
    seed: 12345,
    contractType: "Hợp đồng dịch vụ",
    locale: "vi_VN",
    activeMutations: [],
    model: "gemini-3-flash-preview"
  });

  const { result, fakerData, isGenerating, error, generate, setError } = useContractGenerator();

  const handleGenerate = () => generate(config);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#FEFBF3] via-[#FFFBF0] to-[#F8F9FF] text-[#2D3748] overflow-hidden">
      {activeView === 'contract' && (
        <ConfigPanel 
          config={config} 
          onChange={setConfig} 
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 border-b border-[#E8EAED]/50 bg-white/60 backdrop-blur-xl flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-[#7B8FFB] via-[#B896F7] to-[#FF8CC8] p-3 rounded-2xl shadow-lg shadow-[#7B8FFB]/25 animate-float">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight text-[#2D3748]">ContractSynth</h1>
              <p className="text-xs text-[#718096] font-medium">AI-Powered Document Generator</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-[#E8EAED] shadow-sm">
              <button
                onClick={() => setActiveView('contract')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                  activeView === 'contract'
                    ? 'bg-gradient-to-r from-[#7B8FFB] to-[#6366F1] text-white shadow-md shadow-[#7B8FFB]/30'
                    : 'text-[#718096] hover:text-[#2D3748] hover:bg-[#F8F9FF]'
                }`}
              >
                <FileText size={18} />
                <span>Contracts</span>
              </button>
              <button
                onClick={() => setActiveView('bankStatement')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                  activeView === 'bankStatement'
                    ? 'bg-gradient-to-r from-[#6BD88A] to-[#48BB78] text-white shadow-md shadow-[#6BD88A]/30'
                    : 'text-[#718096] hover:text-[#2D3748] hover:bg-[#F8F9FF]'
                }`}
              >
                <CreditCard size={18} />
                <span>Bank Statements</span>
              </button>
              <button
                onClick={() => setActiveView('einvoice')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                  activeView === 'einvoice'
                    ? 'bg-gradient-to-r from-[#FF8CC8] to-[#ED64A6] text-white shadow-md shadow-[#FF8CC8]/30'
                    : 'text-[#718096] hover:text-[#2D3748] hover:bg-[#F8F9FF]'
                }`}
              >
                <Receipt size={18} />
                <span>E-Invoices</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#718096] bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full border border-[#E8EAED] shadow-sm">
              <ShieldAlert size={14} className="text-[#6BD88A]" />
              <span className="font-semibold">No Real PII</span>
            </div>
            {result && activeView === 'contract' && (
              <div className="flex items-center space-x-2 text-sm bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full border border-[#E8EAED] shadow-sm">
                <span className="text-[#718096] font-medium">Case ID:</span>
                <span className="font-mono text-[#7B8FFB] font-bold">{result.caseId}</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {error && (
            <div className="absolute top-6 left-6 right-6 z-50 bg-white border-2 border-[#FF6B9D] text-[#C53030] px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md flex items-center animate-fadeIn">
              <ShieldAlert className="mr-4 flex-shrink-0 text-[#FF6B9D]" size={22} />
              <div className="flex-1">
                <p className="font-bold text-base">Generation Failed</p>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="ml-4 p-1.5 hover:bg-[#F8F9FF] rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {activeView === 'contract' && result && <ResultDashboard data={result} fakerData={fakerData} />}
          {activeView === 'bankStatement' && <BankStatementPanel contractData={fakerData} />}
          {activeView === 'einvoice' && <EInvoicePanel contractData={fakerData} />}
        </div>
      </main>
    </div>
  );
};

export default App;
