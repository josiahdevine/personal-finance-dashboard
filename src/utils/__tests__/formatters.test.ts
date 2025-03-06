import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatNumber,
  formatCompactNumber,
  formatDuration,
  formatBytes,
} from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats numbers as USD currency', () => {
      expect(formatCurrency(1234.5678)).toBe('$1,234.57');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('handles undefined and null', () => {
      expect(formatCurrency(undefined)).toBe('$0.00');
      expect(formatCurrency(null)).toBe('$0.00');
    });
  });

  describe('formatPercentage', () => {
    it('formats numbers as percentages', () => {
      expect(formatPercentage(12.345)).toBe('12.3%');
      expect(formatPercentage(12.345, 2)).toBe('12.35%');
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('handles undefined and null', () => {
      expect(formatPercentage(undefined)).toBe('0%');
      expect(formatPercentage(null)).toBe('0%');
    });
  });

  describe('formatDate', () => {
    it('formats dates consistently', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date)).toBe('Mar 15, 2024');
    });

    it('handles date strings', () => {
      expect(formatDate('2024-03-15')).toBe('Mar 15, 2024');
    });

    it('handles undefined and null', () => {
      expect(formatDate(undefined)).toBe('');
      expect(formatDate(null)).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,568');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(-1234567.89)).toBe('-1,234,568');
    });

    it('handles undefined and null', () => {
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber(null)).toBe('0');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats numbers in compact notation', () => {
      expect(formatCompactNumber(1234)).toBe('1.2K');
      expect(formatCompactNumber(1234567)).toBe('1.2M');
      expect(formatCompactNumber(0)).toBe('0');
    });

    it('handles undefined and null', () => {
      expect(formatCompactNumber(undefined)).toBe('0');
      expect(formatCompactNumber(null)).toBe('0');
    });
  });

  describe('formatDuration', () => {
    it('formats durations in human readable form', () => {
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(60000)).toBe('1m');
      expect(formatDuration(3600000)).toBe('1h');
      expect(formatDuration(86400000)).toBe('1d');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes in human readable form', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });
}); 