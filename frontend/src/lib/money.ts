/**
 * Currency and financial arithmetic helpers.
 * Guarantees zero floating-point imprecision by computing totals in integer minor units (paise).
 * Formats according to the Indian numbering system (e.g. ₹1,25,000.00).
 */

/**
 * Converts a decimal string or number to integer paise (1 INR = 100 paise)
 * using string parsing to eliminate float rounding errors.
 */
export function toMinorUnits(amount: string | number): bigint {
  const str = typeof amount === 'number' ? amount.toFixed(2) : amount.trim();
  const parts = str.split('.');
  const wholeStr = parts[0] || '0';
  const fracStr = (parts[1] || '').padEnd(2, '0').slice(0, 2);
  const whole = BigInt(wholeStr.replace(/[^0-9-]/g, '') || '0');
  const frac = BigInt(fracStr.replace(/[^0-9]/g, '') || '0');
  const sign = str.trim().startsWith('-') ? -1n : 1n;
  const absWhole = whole < 0n ? -whole : whole;
  return sign * (absWhole * 100n + frac);
}

/**
 * Converts integer minor units (paise) back to a standard decimal string (e.g. "125.50").
 */
export function fromMinorUnits(minorUnits: bigint): string {
  const isNegative = minorUnits < 0n;
  const abs = isNegative ? -minorUnits : minorUnits;
  const whole = abs / 100n;
  const frac = abs % 100n;
  const sign = isNegative ? '-' : '';
  return `${sign}${whole.toString()}.${frac.toString().padStart(2, '0')}`;
}

/**
 * Calculates line item total without floating-point math:
 * price * quantity
 */
export function calculateLineTotal(price: string | number, quantity: number): string {
  if (quantity <= 0) return '0.00';
  const minor = toMinorUnits(price);
  const totalMinor = minor * BigInt(quantity);
  return fromMinorUnits(totalMinor);
}

/**
 * Calculates cart or order total without floating-point math:
 * sum(price_i * quantity_i)
 */
export function calculateTotalAmount(
  items: Array<{ price: string | number; quantity: number }>,
): string {
  let totalMinor = 0n;
  for (const item of items) {
    if (item.quantity > 0) {
      totalMinor += toMinorUnits(item.price) * BigInt(item.quantity);
    }
  }
  return fromMinorUnits(totalMinor);
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats any amount string or number to Indian Rupee standard format (e.g. "₹250.00").
 */
export function formatINR(amount: string | number): string {
  const minor = toMinorUnits(amount);
  const decimalNumber = Number(minor) / 100;
  return inrFormatter.format(decimalNumber);
}
