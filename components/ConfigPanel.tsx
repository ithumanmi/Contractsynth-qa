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
    <div className="w-96 bg-white/80 backdrop-blur-xl border-r border-[#E8EAED]/50 flex flex-col h-full overflow-hidden shadow-xl">
      <div className="p-6 border-b border-[#E8EAED]/50 bg-gradient-to-br from-white to-[#F8F9FF]">
        <div className="flex items-center space-x-3 mb-1">
          <div className="bg-gradient-to-br from-[#7B8FFB] via-[#B896F7] to-[#FF8CC8] p-2.5 rounded-2xl shadow-lg shadow-[#7B8FFB]/25">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-[#2D3748] tracking-tight">Configuration</h1>
            <p className="text-xs text-[#718096] font-medium">Customize your generation</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        <div className="card-floating p-5 animate-fadeIn">
          <h3 className="text-xs font-bold text-[#718096] uppercase tracking-wider mb-4 flex items-center">
            <Settings size={14} className="mr-2 text-[#7B8FFB]" />
            Basic Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="seed-input" className="block text-sm font-semibold text-[#2D3748] mb-2">
                Seed
                <span className="text-xs text-[#A0AEC0] ml-2 font-normal">(Deterministic)</span>
              </label>
              <div className="flex space-x-2">
                <input 
                  id="seed-input"
                  type="number" 
                  value={config.seed}
                  onChange={(e) => handleInputChange('seed', Number.parseInt(e.target.value) || 0)}
                  className="flex-1 input-field"
                />
                <button 
                  onClick={() => handleInputChange('seed', Math.floor(Math.random() * 10000))}
                  className="bg-white border-2 border-[#E8EAED] hover:border-[#7B8FFB] text-[#718096] hover:text-[#7B8FFB] p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                  title="Generate new seed"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="contract-type-select" className="block text-sm font-semibold text-[#2D3748] mb-2">
                Contract Type
              </label>
              <select 
                id="contract-type-select"
                value={config.contractType}
                onChange={(e) => handleInputChange('contractType', e.target.value)}
                className="input-field cursor-pointer"
              >
                {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="locale-select" className="block text-sm font-semibold text-[#2D3748] mb-2">
                Locale
              </label>
              <select 
                id="locale-select"
                value={config.locale}
                onChange={(e) => handleInputChange('locale', e.target.value)}
                className="input-field cursor-pointer"
              >
                {LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card-floating p-5 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-[#718096] uppercase tracking-wider flex items-center">
              <Activity size={14} className="mr-2 text-[#FF8CC8]" />
              Mutation Controls
            </h3>
            <span className="badge bg-gradient-to-r from-[#7B8FFB]/10 to-[#B896F7]/10 border-[#7B8FFB]/30 text-[#7B8FFB]">
              {config.activeMutations.length} Active
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(mutationsByCategory).map(([category, mutations]: [string, MutationDef[]]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${CATEGORY_COLORS[category] || 'bg-[#F8F9FF] text-[#718096] border-[#E8EAED]'}`}>
                    {CATEGORY_ICONS[category] || '?'}
                  </span>
                  <span className="text-xs font-semibold text-[#718096] uppercase tracking-wide">{category}</span>
                </div>
                <div className="space-y-2 pl-4">
                  {mutations.map((mutation) => (
                    <button
                      key={mutation.code} 
                      type="button"
                      className={`relative w-full p-3.5 rounded-2xl border-2 transition-all duration-200 text-left group ${
                        config.activeMutations.includes(mutation.code) 
                          ? 'bg-gradient-to-br from-[#7B8FFB]/10 to-[#B896F7]/10 border-[#7B8FFB] shadow-md shadow-[#7B8FFB]/20' 
                          : 'bg-white border-[#E8EAED] hover:border-[#7B8FFB]/50 hover:bg-[#F8F9FF] hover:shadow-sm'
                      }`}
                      onClick={() => handleToggleMutation(mutation.code)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <input 
                            type="checkbox" 
                            checked={config.activeMutations.includes(mutation.code)}
                            readOnly
                            className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#7B8FFB] focus:ring-[#7B8FFB] bg-white cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold font-mono ${
                                config.activeMutations.includes(mutation.code) 
                                  ? 'text-[#7B8FFB]' 
                                  : 'text-[#718096]'
                              }`}>
                                {mutation.code}
                              </span>
                            </div>
                            <p className="text-xs text-[#718096] mt-1 leading-relaxed">
                              {mutation.name}
                            </p>
                            <p className="text-xs text-[#A0AEC0] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

      <div className="p-6 border-t border-[#E8EAED]/50 bg-gradient-to-br from-white to-[#F8F9FF]">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center space-x-3 font-bold text-white transition-all shadow-lg ${
            isGenerating 
              ? 'bg-[#A0AEC0] cursor-not-allowed' 
              : 'button-primary'
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
