import React, { useState, useMemo } from 'react';
import { ParsedResponse, FakerData } from '../types';
import { JsonDisplay } from './JsonDisplay';
import { AlertTriangle, CheckCircle, FileText, Activity, Download, Shield, TrendingUp } from 'lucide-react';
import { exportPdf } from '../utils/export';

interface ResultDashboardProps {
  data: ParsedResponse;
  fakerData: FakerData | null;
}


export const ResultDashboard: React.FC<ResultDashboardProps> = ({ data, fakerData }) => {
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


  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 flex space-x-6 p-6">
        <div className="w-2/3 flex flex-col card-floating overflow-hidden animate-fadeIn">
          <div className="flex border-b border-[#E8EAED] bg-gradient-to-r from-white to-[#F8F9FF]">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center space-x-2 transition-all rounded-tl-2xl ${
                activeTab === 'preview' 
                  ? 'bg-white text-[#7B8FFB] border-b-2 border-[#7B8FFB] shadow-sm' 
                  : 'text-[#718096] hover:text-[#2D3748] hover:bg-[#F8F9FF]'
              }`}
            >
              <FileText size={18} /> 
              <span>Observed Contract</span>
            </button>
            <button 
              onClick={() => setActiveTab('anomalies')}
              className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center space-x-2 transition-all rounded-tr-2xl ${
                activeTab === 'anomalies' 
                  ? 'bg-white text-[#FF8CC8] border-b-2 border-[#FF8CC8] shadow-sm' 
                  : 'text-[#718096] hover:text-[#2D3748] hover:bg-[#F8F9FF]'
              }`}
            >
              <Activity size={18} /> 
              <span>QA / Anomalies</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-white">
            {activeTab === 'preview' && (
              <div className="space-y-4">
                {hasWatermark && (
                  <div className="bg-gradient-to-r from-[#6BD88A]/10 to-[#48BB78]/10 border-2 border-[#6BD88A]/30 rounded-2xl p-4 flex items-center space-x-3 animate-fadeIn">
                    <Shield className="text-[#6BD88A]" size={22} />
                    <div>
                      <p className="text-sm font-bold text-[#6BD88A]">Watermark Valid</p>
                      <p className="text-xs text-[#718096] font-medium">Synthetic data marker detected</p>
                    </div>
                  </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none font-mono text-[#2D3748] whitespace-pre-wrap leading-relaxed bg-[#F8F9FF] rounded-2xl p-6 border-2 border-[#E8EAED] shadow-sm">
                  {data.observedText}
                </div>
              </div>
            )}
            {activeTab === 'anomalies' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#FFD93D]/10 to-[#FFB86C]/10 border-2 border-[#FFD93D]/30 rounded-2xl p-6 animate-fadeIn">
                  <h4 className="text-[#FFB86C] font-bold mb-4 text-sm uppercase tracking-wider flex items-center">
                    <Activity size={16} className="mr-2" />
                    Active Mutations
                  </h4>
                  {data.anomalies.length === 0 ? (
                    <p className="text-[#718096] text-sm italic">No mutations applied. Clean case.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.anomalies.map((anom, idx) => (
                        <div key={idx} className="flex items-start space-x-3 bg-white rounded-xl p-3.5 border-2 border-[#E8EAED] shadow-sm hover:shadow-md transition-all">
                          <span className="font-mono bg-gradient-to-r from-[#FF8CC8]/10 to-[#ED64A6]/10 text-[#FF8CC8] px-3 py-1 rounded-xl text-xs font-bold border border-[#FF8CC8]/30">
                            {anom.code}
                          </span>
                          <span className="text-sm text-[#2D3748] flex-1 font-medium">{anom.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="card-floating p-6 animate-fadeIn">
                  <h4 className="text-[#718096] font-bold mb-4 text-sm uppercase tracking-wider">Pass Criteria</h4>
                  <ul className="space-y-2">
                    {data.passCriteria.map((crit, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-[#2D3748]">
                        <CheckCircle size={16} className="text-[#6BD88A] mt-0.5 flex-shrink-0" />
                        <span className="font-medium">{crit}</span>
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
            <JsonDisplay data={data.truthIntendedJson} title="TRUTH_INTENDED (GOLD STANDARD)" colorClass="text-[#6BD88A]" />
          </div>
          <div className="h-80">
            <JsonDisplay data={data.varsJson} title="VARS_JSON (INPUT DATA)" colorClass="text-[#7B8FFB]" />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-[#E8EAED] px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 ${
            hasWatermark 
              ? 'bg-gradient-to-r from-[#6BD88A]/10 to-[#48BB78]/10 border-[#6BD88A]/30 text-[#6BD88A]' 
              : 'bg-gradient-to-r from-[#FF6B9D]/10 to-[#ED64A6]/10 border-[#FF6B9D]/30 text-[#FF6B9D]'
          }`}>
            {hasWatermark ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span className="text-xs font-bold">Watermark</span>
          </div>
          
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border-2 border-[#E8EAED] shadow-sm">
            <TrendingUp size={16} className="text-[#6BD88A]" />
            <span className="text-xs text-[#718096] font-medium">Integrity:</span>
            <span className={`text-xs font-bold ${
              integrityScore >= 80 ? 'text-[#6BD88A]' : 
              integrityScore >= 50 ? 'text-[#FFD93D]' : 'text-[#FF6B9D]'
            }`}>
              {integrityScore}%
            </span>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border-2 border-[#E8EAED] shadow-sm">
            <Activity size={16} className="text-[#FF8CC8]" />
            <span className="text-xs text-[#718096] font-medium">Anomalies:</span>
            <span className={`text-xs font-bold ${
              data.anomalies.length === 0 ? 'text-[#6BD88A]' : 'text-[#FF8CC8]'
            }`}>
              {data.anomalies.length}
            </span>
          </div>

        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportPdf}
            disabled={isExporting}
            className="button-primary flex items-center space-x-2 px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
