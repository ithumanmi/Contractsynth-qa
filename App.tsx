import React, { useState } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { ResultDashboard } from './components/ResultDashboard';
import { GeneratorConfig } from './types';
import { useContractGenerator } from './hooks/useContractGenerator';
import { ShieldAlert, Zap, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<GeneratorConfig>({
    seed: 12345,
    contractType: "Hợp đồng dịch vụ",
    locale: "vi_VN",
    activeMutations: [],
    model: "gemini-3-flash-preview"
  });

  const { result, isGenerating, error, generate, setError } = useContractGenerator();

  const handleGenerate = () => generate(config);

  return (
    <div className="flex h-screen bg-[#0f172a] text-[#f1f5f9] overflow-hidden">
      <ConfigPanel 
        config={config} 
        onChange={setConfig} 
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-[#1e293b] bg-[#1e293b]/80 backdrop-blur-sm flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-[#4f46e5] to-[#312e81] p-2 rounded-xl shadow-lg shadow-[#4f46e5]/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-[#f1f5f9]">ContractSynth QA</h1>
              <p className="text-xs text-[#94a3b8]">AI Contract Quality Assurance & Dataset Generation</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-xs text-[#64748b] bg-[#1e293b] px-4 py-2 rounded-full border border-[#334155]">
              <ShieldAlert size={14} className="text-[#10b981]" />
              <span>No Real PII</span>
            </div>
            {result && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-[#94a3b8]">Case ID:</span>
                <span className="font-mono text-[#14b8a6] font-semibold">{result.caseId}</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {error && (
            <div className="absolute top-6 left-6 right-6 z-50 bg-[#7f1d1d]/90 border border-[#ef4444] text-[#fca5a5] px-6 py-4 rounded-xl shadow-xl backdrop-blur-md flex items-center animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="mr-4 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-bold text-base">Generation Failed</p>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="ml-4 text-sm hover:underline font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {result ? (
            <ResultDashboard data={result} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#64748b] space-y-8">
              <div className="w-32 h-32 rounded-2xl bg-[#1e293b] border-2 border-dashed border-[#334155] flex items-center justify-center">
                <Zap size={48} className="text-[#4f46e5]" />
              </div>
              <div className="text-center max-w-lg">
                <h3 className="text-2xl font-bold text-[#f1f5f9] mb-3">Ready to Generate</h3>
                <p className="text-[#94a3b8] leading-relaxed">
                  Configure mutations in the sidebar and click "Generate Case" to create synthetic contract data for AI training and testing.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
