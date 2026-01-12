import React, { useMemo } from 'react';
import { MutationCode, GeneratorConfig, MutationDef } from '../types';
import { CONTRACT_TYPES, LOCALES, MUTATIONS } from '../constants';
import { Settings, Play, RefreshCw, Sparkles, Activity } from 'lucide-react';
import { groupMutationsByCategory, toggleMutation } from '../utils/mutations';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/constants';

interface ConfigPanelProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, onGenerate, isGenerating }) => {
  const mutationsByCategory = useMemo(() => groupMutationsByCategory(), []);

  const handleToggleMutation = (code: MutationCode) => {
    onChange({ ...config, activeMutations: toggleMutation(code, config.activeMutations) });
  };

  const handleInputChange = (key: keyof GeneratorConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="w-96 bg-[#1e293b] border-r border-[#334155] flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-[#334155] bg-[#0f172a]">
        <div className="flex items-center space-x-3 mb-1">
          <div className="bg-gradient-to-br from-[#4f46e5] to-[#312e81] p-2 rounded-xl">
            <Sparkles className="text-white" size={18} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#f1f5f9] tracking-tight">Dataset Config</h1>
            <p className="text-xs text-[#64748b]">Configure synthetic data generation</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div className="bg-[#0f172a] rounded-xl p-5 border border-[#334155] shadow-md">
          <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-4 flex items-center">
            <Settings size={14} className="mr-2" />
            Basic Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="seed-input" className="block text-sm font-medium text-[#f1f5f9] mb-2">
                Seed
                <span className="text-xs text-[#64748b] ml-2 font-normal">(Deterministic)</span>
              </label>
              <div className="flex space-x-2">
                <input 
                  id="seed-input"
                  type="number" 
                  value={config.seed}
                  onChange={(e) => handleInputChange('seed', Number.parseInt(e.target.value) || 0)}
                  className="flex-1 bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                />
                <button 
                  onClick={() => handleInputChange('seed', Math.floor(Math.random() * 10000))}
                  className="bg-[#334155] hover:bg-[#475569] text-[#f1f5f9] p-2.5 rounded-xl transition-colors"
                  title="Generate new seed"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="contract-type-select" className="block text-sm font-medium text-[#f1f5f9] mb-2">
                Contract Type
              </label>
              <select 
                id="contract-type-select"
                value={config.contractType}
                onChange={(e) => handleInputChange('contractType', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              >
                {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="locale-select" className="block text-sm font-medium text-[#f1f5f9] mb-2">
                Locale
              </label>
              <select 
                id="locale-select"
                value={config.locale}
                onChange={(e) => handleInputChange('locale', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              >
                {LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-xl p-5 border border-[#334155] shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider flex items-center">
              <Activity size={14} className="mr-2" />
              Mutation Controls
            </h3>
            <span className="text-xs bg-[#4f46e5]/20 text-[#818cf8] px-2.5 py-1 rounded-full font-semibold border border-[#4f46e5]/30">
              {config.activeMutations.length} Active
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(mutationsByCategory).map(([category, mutations]: [string, MutationDef[]]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${CATEGORY_COLORS[category] || 'bg-[#64748b]/10 text-[#94a3b8] border-[#64748b]/30'}`}>
                    {CATEGORY_ICONS[category] || '?'}
                  </span>
                  <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">{category}</span>
                </div>
                <div className="space-y-2 pl-4">
                  {mutations.map((mutation) => (
                    <button
                      key={mutation.code} 
                      type="button"
                      className={`relative w-full p-3 rounded-xl border transition-all duration-200 text-left group ${
                        config.activeMutations.includes(mutation.code) 
                          ? 'bg-[#4f46e5]/10 border-[#4f46e5]/50 shadow-md' 
                          : 'bg-[#1e293b]/50 border-[#334155] hover:border-[#475569] hover:bg-[#1e293b]'
                      }`}
                      onClick={() => handleToggleMutation(mutation.code)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <input 
                            type="checkbox" 
                            checked={config.activeMutations.includes(mutation.code)}
                            readOnly
                            className="w-4 h-4 rounded border-[#334155] text-[#4f46e5] focus:ring-[#4f46e5] bg-[#0f172a] cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold font-mono ${
                                config.activeMutations.includes(mutation.code) 
                                  ? 'text-[#818cf8]' 
                                  : 'text-[#94a3b8]'
                              }`}>
                                {mutation.code}
                              </span>
                            </div>
                            <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                              {mutation.name}
                            </p>
                            <p className="text-xs text-[#475569] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {mutation.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-[#334155] bg-[#0f172a]">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-3.5 px-6 rounded-xl flex items-center justify-center space-x-3 font-semibold text-white transition-all shadow-lg ${
            isGenerating 
              ? 'bg-[#475569] cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#4f46e5] to-[#312e81] hover:from-[#6366f1] hover:to-[#4338ca] active:scale-[0.98] shadow-[#4f46e5]/30'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" />
              <span>Generate Case</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
