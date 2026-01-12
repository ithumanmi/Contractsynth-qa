import React from 'react';

interface JsonDisplayProps {
  data: any;
  title: string;
  colorClass?: string;
}

export const JsonDisplay: React.FC<JsonDisplayProps> = ({ data, title, colorClass = "text-[#818cf8]" }) => {
  return (
    <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden h-full flex flex-col shadow-lg">
      <div className="bg-[#0f172a] px-5 py-3.5 border-b border-[#334155] flex justify-between items-center">
        <h3 className={`font-mono text-sm font-bold ${colorClass}`}>{title}</h3>
        <span className="text-xs text-[#64748b] uppercase font-semibold tracking-wider">JSON</span>
      </div>
      <div className="p-5 overflow-auto flex-1 custom-scrollbar bg-[#0f172a]">
        <pre className="font-mono text-xs text-[#f1f5f9] whitespace-pre-wrap leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
