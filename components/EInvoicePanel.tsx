import React, { useState, useEffect } from 'react';
import { EInvoiceConfig, FakerData, InvoiceGenerationMode, ReferenceConfig, ConsolidationRules, InvoiceGrouping } from '../types';
import { useEInvoiceGenerator } from '../hooks/useEInvoiceGenerator';
import { exportEInvoiceXML, exportEInvoiceJSON } from '../utils/eInvoiceExport';
import { FileCode, RefreshCw, Download, FileJson, Receipt, Settings, Link2 } from 'lucide-react';

interface EInvoicePanelProps {
  contractData?: FakerData | null;
}

const formatXML = (xml: string): string => {
  const PADDING = '  ';
  const reg = /(>)(<)(\/*)/g;
  let pad = 0;
  
  xml = xml.replace(reg, '$1\r\n$2$3');
  
  return xml.split('\r\n').map((node) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/) && pad > 0) {
      pad -= 1;
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }
    
    pad += indent;
    
    return PADDING.repeat(pad - indent) + node;
  }).join('\r\n');
};

export const EInvoicePanel: React.FC<EInvoicePanelProps> = ({ contractData }) => {
  const [config, setConfig] = useState<EInvoiceConfig>({
    invoiceSeries: 'AA/26E',
    templateCode: '01GTKT0',
    invoiceType: '01GTKT0/001',
    vatRate: contractData?.vatRate || 10,
    currency: 'VND',
    generationMode: 'C1',
    referenceConfig: {
      includeContractNo: true,
      includeAddendumNo: false
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const { result, isGenerating, error, generate } = useEInvoiceGenerator();

  useEffect(() => {
    if (contractData) {
      setConfig(prev => ({
        ...prev,
        vatRate: contractData.vatRate
      }));
    }
  }, [contractData]);

  const handleGenerate = async () => {
    if (!contractData) {
      alert('Please generate a contract first');
      return;
    }
    await generate(contractData, config);
  };

  const handleExportXML = () => {
    if (result) {
      exportEInvoiceXML(result);
    }
  };

  const handleExportJSON = () => {
    if (result) {
      exportEInvoiceJSON(result);
    }
  };

  const updateReferenceConfig = (updates: Partial<ReferenceConfig>) => {
    setConfig(prev => ({
      ...prev,
      referenceConfig: { ...prev.referenceConfig, ...updates }
    }));
  };

  const updateConsolidationRules = (updates: Partial<ConsolidationRules>) => {
    setConfig(prev => ({
      ...prev,
      consolidationRules: { ...(prev.consolidationRules || {}), ...updates }
    }));
  };

  const updateInvoiceGrouping = (updates: Partial<InvoiceGrouping>) => {
    setConfig(prev => ({
      ...prev,
      invoiceGrouping: { ...(prev.invoiceGrouping || {}), ...updates }
    }));
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#FEFBF3] via-[#FFFBF0] to-[#F8F9FF]">
      <div className="p-6 border-b border-[#E8EAED]/50 bg-white/60 backdrop-blur-xl">
        <h2 className="text-2xl font-display font-bold text-[#2D3748] mb-2">E-Invoice Generator</h2>
        <p className="text-sm text-[#718096] font-medium">Generate Vietnam e-invoice XML from contracts</p>
      </div>

      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="card-floating p-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-[#718096] uppercase tracking-wider mb-4 flex items-center">
              <Settings size={16} className="mr-2 text-[#FF8CC8]" />
              Configuration
            </h3>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="generationMode" className="block text-sm font-semibold text-[#2D3748] mb-2 flex items-center">
                  <Link2 size={16} className="mr-2 text-[#7B8FFB]" />
                  Invoice Generation Pattern
                </label>
                <select
                  id="generationMode"
                  value={config.generationMode}
                  onChange={(e) => setConfig({ ...config, generationMode: e.target.value as InvoiceGenerationMode })}
                  className="input-field cursor-pointer"
                >
                  <option value="C1">C1: 1 Agreement → Many Invoices (by milestone/period)</option>
                  <option value="C2">C2: Many Contracts → 1 Invoice (consolidated)</option>
                  <option value="C3">C3: 1 Invoice → Many Agreements (multi-deal)</option>
                  <option value="C4">C4: Many Agreements → Many Invoices (n-n)</option>
                </select>
              </div>

              {config.generationMode === 'C1' && (
                <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] space-y-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#2D3748]">C1 Configuration</h4>
                  <div>
                    <label className="block text-xs text-[#718096] mb-2 font-medium">Invoice Per</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="checkbox"
                          checked={config.invoicePerMilestone || false}
                          onChange={(e) => setConfig({ ...config, invoicePerMilestone: e.target.checked })}
                          className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Each milestone = 1 invoice</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="checkbox"
                          checked={config.invoicePerPhase || false}
                          onChange={(e) => setConfig({ ...config, invoicePerPhase: e.target.checked })}
                          className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Each payment phase = 1 invoice</span>
                      </label>
                    </div>
                  </div>
                  {contractData?.paymentPhases && contractData.paymentPhases.length > 0 && (
                    <div>
                      <label className="block text-xs text-[#718096] mb-2 font-medium">Select Payment Phases</label>
                      <div className="space-y-2 max-h-32 overflow-auto custom-scrollbar">
                        {contractData.paymentPhases.map((phase, idx) => (
                          <label key={idx} className="flex items-center space-x-2 text-sm text-[#2D3748]">
                            <input
                              type="checkbox"
                              checked={config.selectedPaymentPhases?.includes(idx) || false}
                              onChange={(e) => {
                                const phases = config.selectedPaymentPhases || [];
                                if (e.target.checked) {
                                  setConfig({ ...config, selectedPaymentPhases: [...phases, idx] });
                                } else {
                                  setConfig({ ...config, selectedPaymentPhases: phases.filter(p => p !== idx) });
                                }
                              }}
                              className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                            />
                            <span className="font-medium">{phase.phaseName} - {phase.amount.toLocaleString('vi-VN')} VND</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {config.generationMode === 'C2' && (
                <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] space-y-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#2D3748]">C2 Configuration</h4>
                  <div>
                    <label className="block text-xs text-[#718096] mb-2 font-medium">Consolidation Rules</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="checkbox"
                          checked={config.consolidationRules?.sumAllAmounts || false}
                          onChange={(e) => updateConsolidationRules({ sumAllAmounts: e.target.checked })}
                          className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Sum all amounts</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="checkbox"
                          checked={config.consolidationRules?.groupByServiceType || false}
                          onChange={(e) => updateConsolidationRules({ groupByServiceType: e.target.checked })}
                          className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Group by service type</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="checkbox"
                          checked={config.consolidationRules?.groupByPaymentPhase || false}
                          onChange={(e) => updateConsolidationRules({ groupByPaymentPhase: e.target.checked })}
                          className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Group by payment phase</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {config.generationMode === 'C3' && (
                <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] space-y-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#2D3748]">C3 Configuration</h4>
                  <div>
                    <label className="block text-xs text-[#718096] mb-2 font-medium">Consolidation Method</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="radio"
                          name="c3Method"
                          checked={config.consolidationRules?.sumAllAmounts || false}
                          onChange={() => updateConsolidationRules({ sumAllAmounts: true, groupByServiceType: false })}
                          className="w-4 h-4 border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Sum all amounts</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="radio"
                          name="c3Method"
                          checked={config.consolidationRules?.groupByServiceType || false}
                          onChange={() => updateConsolidationRules({ sumAllAmounts: false, groupByServiceType: true })}
                          className="w-4 h-4 border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Group by agreement</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {config.generationMode === 'C4' && (
                <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] space-y-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#2D3748]">C4 Configuration</h4>
                  <div>
                    <label className="block text-xs text-[#718096] mb-2 font-medium">Mapping Strategy</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="radio"
                          name="c4Strategy"
                          checked={config.invoiceGrouping?.byAgreement || false}
                          onChange={() => updateInvoiceGrouping({ byAgreement: true, byDateRange: false, byServiceType: false })}
                          className="w-4 h-4 border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Auto: 1 agreement = 1 invoice</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="radio"
                          name="c4Strategy"
                          checked={config.invoiceGrouping?.byDateRange || false}
                          onChange={() => updateInvoiceGrouping({ byAgreement: false, byDateRange: true, byServiceType: false })}
                          className="w-4 h-4 border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Group by date range</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="radio"
                          name="c4Strategy"
                          checked={config.invoiceGrouping?.byServiceType || false}
                          onChange={() => updateInvoiceGrouping({ byAgreement: false, byDateRange: false, byServiceType: true })}
                          className="w-4 h-4 border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Group by service type</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] space-y-4 shadow-sm">
                <h4 className="text-sm font-semibold text-[#2D3748]">Reference Configuration</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                    <input
                      type="checkbox"
                      checked={config.referenceConfig.includeContractNo}
                      onChange={(e) => updateReferenceConfig({ includeContractNo: e.target.checked })}
                      className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                    />
                    <span className="font-medium">Include contract number</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                    <input
                      type="checkbox"
                      checked={config.referenceConfig.includeAddendumNo}
                      onChange={(e) => updateReferenceConfig({ includeAddendumNo: e.target.checked })}
                      className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                    />
                    <span className="font-medium">Include addendum number</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invoiceSeries" className="block text-sm font-semibold text-[#2D3748] mb-2 flex items-center">
                    <Receipt size={16} className="mr-2 text-[#FF8CC8]" />
                    Invoice Series
                  </label>
                  <input
                    id="invoiceSeries"
                    type="text"
                    value={config.invoiceSeries}
                    onChange={(e) => setConfig({ ...config, invoiceSeries: e.target.value })}
                    placeholder="AA/26E"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="templateCode" className="block text-sm font-semibold text-[#2D3748] mb-2">
                    Template Code
                  </label>
                  <input
                    id="templateCode"
                    type="text"
                    value={config.templateCode}
                    onChange={(e) => setConfig({ ...config, templateCode: e.target.value })}
                    placeholder="01GTKT0"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invoiceType" className="block text-sm font-semibold text-[#2D3748] mb-2">
                    Invoice Type
                  </label>
                  <input
                    id="invoiceType"
                    type="text"
                    value={config.invoiceType}
                    onChange={(e) => setConfig({ ...config, invoiceType: e.target.value })}
                    placeholder="01GTKT0/001"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="vatRate" className="block text-sm font-semibold text-[#2D3748] mb-2">
                    VAT Rate (%)
                  </label>
                  <input
                    id="vatRate"
                    type="number"
                    value={config.vatRate}
                    onChange={(e) => setConfig({ ...config, vatRate: Number.parseFloat(e.target.value) || 10 })}
                    min="0"
                    max="100"
                    step="0.1"
                    className="input-field"
                  />
                  {contractData && (
                    <p className="text-xs text-[#A0AEC0] mt-1 font-medium">
                      From contract: {contractData.vatRate}%
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-semibold text-[#2D3748] mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  className="input-field cursor-pointer"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] shadow-sm">
                <label htmlFor="itemsPerInvoice" className="block text-sm font-semibold text-[#2D3748] mb-2">
                  Items Per Invoice
                </label>
                <input
                  id="itemsPerInvoice"
                  type="number"
                  value={config.itemsPerInvoice || ''}
                  onChange={(e) => setConfig({ ...config, itemsPerInvoice: e.target.value ? Number.parseInt(e.target.value, 10) : undefined })}
                  min="1"
                  max="10"
                  placeholder="Auto (all items)"
                  className="input-field"
                />
                <p className="text-xs text-[#718096] mt-2 font-medium">
                  {contractData && config.itemsPerInvoice ? (
                    <>
                      Contract has {contractData.items.length} items. Will generate {Math.ceil(contractData.items.length / (config.itemsPerInvoice || 1))} invoice(s) with {config.itemsPerInvoice} items each.
                    </>
                  ) : (
                    'Leave empty to include all items in one invoice'
                  )}
                </p>
              </div>

              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-[#718096] hover:text-[#2D3748] font-medium flex items-center space-x-2 transition-colors"
                >
                  <Settings size={14} />
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                </button>
                {showAdvanced && (
                  <div className="mt-4 bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] space-y-4 shadow-sm animate-fadeIn">
                    <div>
                      <label className="flex items-center space-x-2 text-sm text-[#2D3748]">
                        <input
                          type="checkbox"
                          checked={config.includeAuditTrail || false}
                          onChange={(e) => setConfig({ ...config, includeAuditTrail: e.target.checked })}
                          className="w-4 h-4 rounded-lg border-2 border-[#E8EAED] text-[#FF8CC8] focus:ring-[#FF8CC8] bg-white cursor-pointer"
                        />
                        <span className="font-medium">Include audit trail</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {!contractData && (
                <div className="bg-gradient-to-r from-[#FFD93D]/10 to-[#FFB86C]/10 border-2 border-[#FFD93D]/30 rounded-2xl p-4 animate-fadeIn">
                  <p className="text-sm text-[#FFB86C] font-semibold">
                    ⚠️ Please generate a contract first to create e-invoices
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !contractData}
                className="button-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileCode size={18} />
                    <span>Generate E-Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="card-floating p-6 border-2 border-[#FF6B9D] bg-gradient-to-r from-[#FF6B9D]/10 to-[#ED64A6]/10 animate-fadeIn">
              <p className="font-bold text-[#C53030]">Error</p>
              <p className="text-sm mt-1 text-[#C53030] font-medium">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="card-floating p-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#2D3748] mb-1">E-Invoice Summary</h3>
                    <p className="text-sm text-[#718096] font-medium">
                      Status: <span className={`font-semibold ${
                        result.status === 'approved' ? 'text-[#6BD88A]' :
                        result.status === 'rejected' ? 'text-[#FF6B9D]' :
                        'text-[#FFD93D]'
                      }`}>{result.status}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleExportXML}
                      className="px-4 py-2 bg-gradient-to-r from-[#6BD88A] to-[#48BB78] hover:from-[#48BB78] hover:to-[#38A169] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#6BD88A]/30 flex items-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Export XML</span>
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="px-4 py-2 bg-white border-2 border-[#E8EAED] hover:border-[#7B8FFB] text-[#718096] hover:text-[#7B8FFB] rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center space-x-2"
                    >
                      <FileJson size={16} />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {result.approvalCode && (
                  <div className="bg-gradient-to-r from-[#6BD88A]/10 to-[#48BB78]/10 border-2 border-[#6BD88A]/30 rounded-2xl p-4 mb-6 animate-fadeIn">
                    <p className="text-xs text-[#718096] mb-1 font-medium">Approval Code</p>
                    <p className="text-sm font-mono text-[#6BD88A] font-bold">{result.approvalCode}</p>
                    {result.approvalTime && (
                      <p className="text-xs text-[#A0AEC0] mt-1 font-medium">Approved: {new Date(result.approvalTime).toLocaleString('vi-VN')}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-4 border-2 border-[#E8EAED] shadow-sm">
                    <p className="text-xs text-[#718096] mb-2 font-medium">Invoice Number</p>
                    <p className="text-sm font-mono font-bold text-[#2D3748]">{result.metadata.invoiceNumber}</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-4 border-2 border-[#E8EAED] shadow-sm">
                    <p className="text-xs text-[#718096] mb-2 font-medium">Invoice Date</p>
                    <p className="text-sm font-semibold text-[#2D3748]">{new Date(result.metadata.invoiceDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                {result.invoices && result.invoices.length > 0 && (
                  <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] mb-6 shadow-sm">
                    <p className="text-xs text-[#718096] mb-3 font-medium uppercase tracking-wider">Invoice Details</p>
                    <div className="space-y-4">
                      {result.invoices.map((invoice, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-[#E8EAED] shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-[#2D3748]">Invoice #{idx + 1}</p>
                            <p className="text-xs text-[#718096] font-mono font-medium">{invoice.invoiceNumber}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-[#718096] mb-1 font-medium">Items</p>
                              <p className="text-[#2D3748] font-bold">{invoice.items.length}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#718096] mb-1 font-medium">Total Payable</p>
                              <p className="text-[#6BD88A] font-bold">{invoice.summary.totalPayable.toLocaleString('vi-VN')} {config.currency}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#718096] mb-1 font-medium">Before VAT</p>
                              <p className="text-[#2D3748] font-semibold">{invoice.summary.totalBeforeVAT.toLocaleString('vi-VN')} {config.currency}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#718096] mb-1 font-medium">VAT Amount</p>
                              <p className="text-[#2D3748] font-semibold">{invoice.summary.totalVAT.toLocaleString('vi-VN')} {config.currency}</p>
                            </div>
                          </div>
                          {invoice.refTokens && invoice.refTokens.length > 0 && (
                            <div className="mt-3 pt-3 border-t-2 border-[#E8EAED]">
                              <p className="text-xs text-[#718096] mb-1 font-medium">References</p>
                              <p className="text-xs text-[#2D3748] font-mono font-medium">{invoice.refTokens.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!result.invoices && contractData && (
                  <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] mb-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-[#718096] mb-3 font-medium uppercase tracking-wider">Seller</p>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-[#2D3748]">{contractData.partyA.name}</p>
                          <p className="text-xs text-[#718096] font-medium">Tax ID: <span className="text-[#2D3748] font-mono font-semibold">{contractData.partyA.taxId}</span></p>
                          <p className="text-xs text-[#718096] font-medium">{contractData.partyA.address}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#718096] mb-3 font-medium uppercase tracking-wider">Buyer</p>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-[#2D3748]">{contractData.partyB.name}</p>
                          <p className="text-xs text-[#718096] font-medium">Tax ID: <span className="text-[#2D3748] font-mono font-semibold">{contractData.partyB.taxId}</span></p>
                          <p className="text-xs text-[#718096] font-medium">{contractData.partyB.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {contractData && (
                  <div className="bg-gradient-to-br from-[#F8F9FF] to-white rounded-2xl p-5 border-2 border-[#E8EAED] shadow-sm">
                    <p className="text-xs text-[#718096] mb-3 font-medium uppercase tracking-wider">Financial Summary</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-[#718096] mb-1 font-medium">Total Before VAT</p>
                        <p className="text-sm font-bold text-[#2D3748]">
                          {contractData.totalAmount.toLocaleString('vi-VN')} {config.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#718096] mb-1 font-medium">VAT ({config.vatRate}%)</p>
                        <p className="text-sm font-bold text-[#2D3748]">
                          {Math.round(contractData.totalAmount * config.vatRate / 100).toLocaleString('vi-VN')} {config.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#718096] mb-1 font-medium">Total Payable</p>
                        <p className="text-sm font-bold text-[#6BD88A]">
                          {(contractData.totalAmount + Math.round(contractData.totalAmount * config.vatRate / 100)).toLocaleString('vi-VN')} {config.currency}
                        </p>
                      </div>
                    </div>
                    {contractData.paymentPhases && contractData.paymentPhases.length > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-[#E8EAED]">
                        <p className="text-xs text-[#718096] mb-2 font-medium uppercase tracking-wider">Payment Phases</p>
                        <div className="space-y-2">
                          {contractData.paymentPhases.map((phase, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-[#2D3748] font-medium">{phase.phaseName}</span>
                              <span className="text-[#718096] font-semibold">{phase.amount.toLocaleString('vi-VN')} {config.currency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="card-floating p-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border-2 border-[#E8EAED] overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-white to-[#F8F9FF] px-5 py-3 border-b-2 border-[#E8EAED] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">XML Content</span>
                    <span className="text-xs text-[#718096] font-mono font-semibold">{result.metadata.invoiceNumber}</span>
                  </div>
                  <div className="p-6 overflow-auto max-h-[600px] custom-scrollbar bg-white">
                    <pre className="text-xs text-[#2D3748] font-mono leading-relaxed">
                      <code className="text-[#2D3748]">
                        {formatXML(result.xml)}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
