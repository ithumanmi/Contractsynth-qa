type LogLevel = 'info' | 'warn' | 'error' | 'success';

const getPrefix = (level: LogLevel, label: string): string => {
  const icons = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    success: '✅'
  };
  return `${icons[level]} [${label}]`;
};

export const logger = {
  info: (label: string, ...args: any[]) => {
    console.log(getPrefix('info', label), ...args);
  },
  warn: (label: string, ...args: any[]) => {
    console.warn(getPrefix('warn', label), ...args);
  },
  error: (label: string, ...args: any[]) => {
    console.error(getPrefix('error', label), ...args);
  },
  success: (label: string, ...args: any[]) => {
    console.log(getPrefix('success', label), ...args);
  }
};


