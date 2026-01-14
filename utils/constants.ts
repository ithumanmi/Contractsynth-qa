export const COLORS = {
  primary: '#7B8FFB',
  primaryDark: '#6366F1',
  secondary: '#B896F7',
  success: '#6BD88A',
  warning: '#FFD93D',
  error: '#FF6B9D',
  surface: '#FFFFFF',
  surfaceLight: '#F8F9FF',
  surfaceDark: '#FEFBF3',
  textPrimary: '#2D3748',
  textSecondary: '#718096',
  textTertiary: '#A0AEC0',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Formatting: 'bg-[#7B8FFB]/10 text-[#7B8FFB] border-[#7B8FFB]/30',
  Logic: 'bg-[#FFD93D]/10 text-[#FFB86C] border-[#FFD93D]/30',
  Content: 'bg-[#6BD88A]/10 text-[#6BD88A] border-[#6BD88A]/30',
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
