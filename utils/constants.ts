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

