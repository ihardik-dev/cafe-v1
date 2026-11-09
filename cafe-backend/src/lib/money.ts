/** Convert a database decimal or numeric input into integer paise/cents safely. */
export function decimalToMinorUnits(value: string | number | { toFixed: (digits: number) => string }): bigint {
  const fixed = typeof value === 'object' ? value.toFixed(2) : Number(value).toFixed(2);
  if (!/^\d+\.\d{2}$/.test(fixed)) throw new Error('Money value must be a non-negative decimal');
  const [whole = '0', fraction = '00'] = fixed.split('.');
  return BigInt(whole) * 100n + BigInt(fraction);
}

export function minorUnitsToDecimal(value: bigint): string {
  const whole = value / 100n;
  const fraction = (value % 100n).toString().padStart(2, '0');
  return `${whole}.${fraction}`;
}

export function calculateLineTotal(price: string | number, quantity: number): string {
  return minorUnitsToDecimal(decimalToMinorUnits(price) * BigInt(quantity));
}
