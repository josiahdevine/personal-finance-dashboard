export const numberUtils = {
  round: (value: number, decimals: number = 2): number => {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
  },
  
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },
  
  formatCompact: (value: number): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    });
    return formatter.format(value);
  },
  
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  }
}; 