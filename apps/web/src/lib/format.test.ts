import {
  formatIndicatorValue,
  formatIndicatorDate,
  formatVariationPercent,
} from './format';

describe('formatIndicatorValue', () => {
  it('formats a number using pt-BR thousands and decimal separators', () => {
    expect(formatIndicatorValue(5157.4321)).toBe('5.157,4321');
  });

  it('does not pad trailing zeros beyond what is needed', () => {
    expect(formatIndicatorValue(3.63)).toBe('3,63');
  });

  it('rounds to at most 4 decimal places', () => {
    expect(formatIndicatorValue(332.813123456)).toBe('332,8131');
  });
});

describe('formatIndicatorDate', () => {
  it('converts an ISO date string to Brazilian day/month/year format', () => {
    expect(formatIndicatorDate('2026-09-01')).toBe('01/09/2026');
  });

  it('handles single-digit months and days without losing characters', () => {
    expect(formatIndicatorDate('2026-01-05')).toBe('05/01/2026');
  });
});

describe('formatVariationPercent', () => {
  it('prefixes a plus sign for positive variation', () => {
    expect(formatVariationPercent(1.8518)).toBe('+1.85%');
  });

  it('keeps the minus sign for negative variation without adding a plus', () => {
    expect(formatVariationPercent(-0.4747)).toBe('-0.47%');
  });

  it('does not add a sign for zero variation', () => {
    expect(formatVariationPercent(0)).toBe('0.00%');
  });
});
