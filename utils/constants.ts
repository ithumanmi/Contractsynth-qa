export const COLORS = {
  primary: '#4f46e5',
  primaryDark: '#312e81',
  secondary: '#14b8a6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  surface: '#1e293b',
  surfaceLight: '#334155',
  surfaceDark: '#0f172a',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Formatting: 'bg-[#4f46e5]/10 text-[#818cf8] border-[#4f46e5]/30',
  Logic: 'bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/30',
  Content: 'bg-[#14b8a6]/10 text-[#5eead4] border-[#14b8a6]/30',
};

export const CATEGORY_ICONS: Record<string, string> = {
  Formatting: 'F',
  Logic: 'L',
  Content: 'C',
};

export const generateCaseId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `CASE_${year}${month}${day}_${hours}${minutes}${seconds}`;
};

