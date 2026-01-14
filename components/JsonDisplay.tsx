import React from 'react';

interface JsonDisplayProps {
  data: any;
  title: string;
  colorClass?: string;
}

export const JsonDisplay: React.FC<JsonDisplayProps> = ({ data, title, colorClass = "text-[#7B8FFB]" }) => {
  return (
    <div className="card-floating overflow-hidden h-full flex flex-col animate-fadeIn">
      <div className="bg-gradient-to-r from-white to-[#F8F9FF] px-5 py-3.5 border-b border-[#E8EAED] flex justify-between items-center">
        <h3 className={`font-mono text-sm font-bold ${colorClass}`}>{title}</h3>
        <span className="text-xs text-[#718096] uppercase font-semibold tracking-wider bg-[#F8F9FF] px-2.5 py-1 rounded-lg border border-[#E8EAED]">JSON</span>
      </div>
      <div className="p-5 overflow-auto flex-1 custom-scrollbar bg-white">
        <pre className="font-mono text-xs text-[#2D3748] whitespace-pre-wrap leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
