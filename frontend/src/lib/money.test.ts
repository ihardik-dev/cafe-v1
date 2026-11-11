import { describe, expect, it } from 'vitest';
import {
  toMinorUnits,
  fromMinorUnits,
  calculateLineTotal,
  calculateTotalAmount,
  formatINR,
} from './money';

describe('money arithmetic and INR formatting', () => {
  it('converts decimal string and numbers to integer minor units (paise) without float drift', () => {
    expect(toMinorUnits('125.50')).toBe(12550n);
    expect(toMinorUnits('0.10')).toBe(10n);
    expect(toMinorUnits('0.20')).toBe(20n);
    expect(toMinorUnits(125.5)).toBe(12550n);
  });

  it('converts minor units back to standard decimal strings', () => {
    expect(fromMinorUnits(12550n)).toBe('125.50');
    expect(fromMinorUnits(99n)).toBe('0.99');
    expect(fromMinorUnits(5n)).toBe('0.05');
  });

  it('calculates line item total accurately without float imprecision', () => {
    // 0.10 + 0.20 float pitfall test:
    const total = calculateLineTotal('0.10', 3);
    expect(total).toBe('0.30');
  });

  it('calculates multi-item cart totals with exact integer math', () => {
    const items = [
      { price: '120.50', quantity: 2 }, // 241.00
      { price: '85.25', quantity: 3 }, // 255.75
      { price: '45.00', quantity: 1 }, // 45.00
    ];
    // Total should be 541.75
    expect(calculateTotalAmount(items)).toBe('541.75');
  });

  it('formats amounts in Indian Rupee format (INR)', () => {
    const formatted = formatINR('125000.50');
    // Checks that the formatted string includes the rupee symbol and standard grouping
    expect(formatted).toContain('₹');
    expect(formatted).toContain('1,25,000.50');
  });
});
