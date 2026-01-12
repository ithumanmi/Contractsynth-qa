import React, { useState, useMemo } from 'react';
import { ParsedResponse } from '../types';
import { JsonDisplay } from './JsonDisplay';
import { AlertTriangle, CheckCircle, FileText, Activity, Download, FileJson, Shield, TrendingUp } from 'lucide-react';
import { exportPdf, exportJson } from '../utils/export';

interface ResultDashboardProps {
  data: ParsedResponse;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'anomalies'>('preview');
  const [isExporting, setIsExporting] = useState(false);

  const hasWatermark = useMemo(() => data.observedText.includes("*** DỮ LIỆU THỬ NGHIỆM"), [data.observedText]);
  const integrityScore = useMemo(() => data.anomalies.length === 0 ? 100 : Math.max(0, 100 - (data.anomalies.length * 10)), [data.anomalies.length]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportPdf(data);
    } catch (err: any) {
      alert("PDF export failed: " + (err.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    exportJson(data);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 flex space-x-6 p-6">
        <div className="w-2/3 flex flex-col bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden shadow-lg">
          <div className="flex border-b border-[#334155] bg-[#0f172a]">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'preview' 
                  ? 'bg-[#1e293b] text-[#f1f5f9] border-b-2 border-[#4f46e5]' 
                  : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]/50'
              }`}
            >
              <FileText size={18} /> 
              <span>Observed Contract</span>
            </button>
            <button 
              onClick={() => setActiveTab('anomalies')}
              className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'anomalies' 
                  ? 'bg-[#1e293b] text-[#f59e0b] border-b-2 border-[#f59e0b]' 
                  : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]/50'
              }`}
            >
              <Activity size={18} /> 
              <span>QA / Anomalies</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-[#0f172a]">
            {activeTab === 'preview' && (
              <div className="space-y-4">
                {hasWatermark && (
                  <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 flex items-center space-x-3">
                    <Shield className="text-[#10b981]" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-[#10b981]">Watermark Valid</p>
                      <p className="text-xs text-[#64748b]">Synthetic data marker detected</p>
                    </div>
                  </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none font-mono text-[#f1f5f9] whitespace-pre-wrap leading-relaxed bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
                  {data.observedText}
                </div>
              </div>
            )}
            {activeTab === 'anomalies' && (
              <div className="space-y-6">
                <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-6">
                  <h4 className="text-[#fbbf24] font-bold mb-4 text-sm uppercase tracking-wider flex items-center">
                    <Activity size={16} className="mr-2" />
                    Active Mutations
                  </h4>
                  {data.anomalies.length === 0 ? (
                    <p className="text-[#94a3b8] text-sm italic">No mutations applied. Clean case.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.anomalies.map((anom, idx) => (
                        <div key={idx} className="flex items-start space-x-3 bg-[#1e293b] rounded-lg p-3 border border-[#334155]">
                          <span className="font-mono bg-[#f59e0b]/20 text-[#fbbf24] px-2 py-1 rounded text-xs font-bold border border-[#f59e0b]/30">
                            {anom.code}
                          </span>
                          <span className="text-sm text-[#f1f5f9] flex-1">{anom.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
                  <h4 className="text-[#94a3b8] font-bold mb-4 text-sm uppercase tracking-wider">Pass Criteria</h4>
                  <ul className="space-y-2">
                    {data.passCriteria.map((crit, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-[#f1f5f9]">
                        <CheckCircle size={16} className="text-[#10b981] mt-0.5 flex-shrink-0" />
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/3 flex flex-col space-y-6">
          <div className="flex-1">
            <JsonDisplay data={data.truthIntendedJson} title="TRUTH_INTENDED (GOLD STANDARD)" colorClass="text-[#14b8a6]" />
          </div>
          <div className="h-80">
            <JsonDisplay data={data.varsJson} title="VARS_JSON (INPUT DATA)" colorClass="text-[#818cf8]" />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#1e293b] border-t border-[#334155] px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
              hasWatermark 
                ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' 
                : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
            }`}>
              {hasWatermark ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span className="text-xs font-semibold">Watermark</span>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155]">
              <TrendingUp size={16} className="text-[#14b8a6]" />
              <span className="text-xs text-[#94a3b8]">Integrity:</span>
              <span className={`text-xs font-bold ${
                integrityScore >= 80 ? 'text-[#10b981]' : 
                integrityScore >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
              }`}>
                {integrityScore}%
              </span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155]">
              <Activity size={16} className="text-[#f59e0b]" />
              <span className="text-xs text-[#94a3b8]">Anomalies:</span>
              <span className={`text-xs font-bold ${
                data.anomalies.length === 0 ? 'text-[#10b981]' : 'text-[#f59e0b]'
              }`}>
                {data.anomalies.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportJson}
            className="flex items-center space-x-2 px-4 py-2 bg-[#334155] hover:bg-[#475569] text-[#f1f5f9] rounded-xl text-sm font-semibold transition-colors border border-[#475569]"
          >
            <FileJson size={16} />
            <span>Export JSON</span>
          </button>
          
          <button 
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#4f46e5] to-[#312e81] hover:from-[#6366f1] hover:to-[#4338ca] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#4f46e5]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
