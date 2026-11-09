import { describe, expect, it } from 'vitest';
import { registerSchema, loginSchema } from '../src/modules/auth/schemas.js';
import { createOrderSchema } from '../src/modules/orders/schemas.js';
import { createReservationSchema } from '../src/modules/reservations/schemas.js';
import { decimalToMinorUnits, minorUnitsToDecimal, calculateLineTotal } from '../src/lib/money.js';
import { canCancelOrder, canCancelReservation, indiaLocalDateTimeToUtc } from '../src/lib/time.js';

describe('authentication validation', () => {
  it('accepts valid registration and normalizes email', () => {
    expect(registerSchema.parse({ name: 'Cafe User', email: 'TEST@EXAMPLE.COM', password: 'password123' })).toEqual({
      name: 'Cafe User', email: 'test@example.com', password: 'password123',
    });
  });

  it('rejects names shorter than two characters', () => {
    expect(registerSchema.safeParse({ name: 'A', email: 'a@example.com', password: 'password123' }).success).toBe(false);
  });

  it('rejects invalid email addresses', () => {
    expect(registerSchema.safeParse({ name: 'A User', email: 'invalid', password: 'password123' }).success).toBe(false);
  });

  it('rejects passwords shorter than eight characters', () => {
    expect(registerSchema.safeParse({ name: 'A User', email: 'a@example.com', password: '1234567' }).success).toBe(false);
  });

  it('does not allow public registration to select a role', () => {
    expect(registerSchema.safeParse({ name: 'A User', email: 'a@example.com', password: 'password123', role: 'ADMIN' }).success).toBe(false);
  });

  it('validates login fields', () => {
    expect(loginSchema.safeParse({ email: 'a@example.com', password: 'password123' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@example.com', password: '' }).success).toBe(false);
  });
});

describe('order input validation', () => {
  const valid = { items: [{ menuItemId: '11111111-1111-4111-8111-111111111111', quantity: 2 }] };

  it('accepts an item quantity from one to ten', () => {
    expect(createOrderSchema.safeParse(valid).success).toBe(true);
    expect(createOrderSchema.safeParse({ items: [{ ...valid.items[0], quantity: 10 }] }).success).toBe(true);
  });

  it('rejects quantity below one or above ten', () => {
    expect(createOrderSchema.safeParse({ items: [{ ...valid.items[0], quantity: 0 }] }).success).toBe(false);
    expect(createOrderSchema.safeParse({ items: [{ ...valid.items[0], quantity: 11 }] }).success).toBe(false);
  });

  it('rejects duplicate menu item IDs and client-submitted prices', () => {
    expect(createOrderSchema.safeParse({ items: [valid.items[0], valid.items[0]] }).success).toBe(false);
    expect(createOrderSchema.safeParse({ ...valid, totalAmount: 1 }).success).toBe(false);
  });
});

describe('reservation input validation', () => {
  it('accepts one through six guests', () => {
    for (const guestCount of [1, 6]) {
      expect(createReservationSchema.safeParse({ reservationDateTime: '2027-01-15T19:30', guestCount }).success).toBe(true);
    }
  });

  it('rejects guest counts outside one through six', () => {
    expect(createReservationSchema.safeParse({ reservationDateTime: '2027-01-15T19:30', guestCount: 0 }).success).toBe(false);
    expect(createReservationSchema.safeParse({ reservationDateTime: '2027-01-15T19:30', guestCount: 7 }).success).toBe(false);
  });

  it('requires the Asia/Kolkata wall-clock format', () => {
    expect(createReservationSchema.safeParse({ reservationDateTime: '2027-01-15T19:30:00Z', guestCount: 2 }).success).toBe(false);
  });
});

describe('money arithmetic', () => {
  it('converts decimal amounts to integer minor units without floating-point drift', () => {
    expect(decimalToMinorUnits('10.10')).toBe(1010n);
    expect(decimalToMinorUnits(0.1)).toBe(10n);
  });

  it('converts minor units back to a two-decimal string', () => {
    expect(minorUnitsToDecimal(12345n)).toBe('123.45');
    expect(minorUnitsToDecimal(5n)).toBe('0.05');
  });

  it('calculates a line total', () => {
    expect(calculateLineTotal('49.90', 3)).toBe('149.70');
  });
});

describe('server-enforced cancellation boundaries', () => {
  const createdAt = new Date('2027-01-01T10:00:00.000Z');

  it('allows order cancellation at exactly 60 seconds', () => {
    expect(canCancelOrder(createdAt, new Date(createdAt.getTime() + 60_000))).toBe(true);
  });

  it('rejects order cancellation after 60 seconds', () => {
    expect(canCancelOrder(createdAt, new Date(createdAt.getTime() + 60_001))).toBe(false);
  });

  it('rejects an order timestamp that is in the future', () => {
    expect(canCancelOrder(createdAt, new Date(createdAt.getTime() - 1))).toBe(false);
  });

  it('allows reservation cancellation with exactly 24 hours remaining', () => {
    const now = new Date('2027-01-01T10:00:00.000Z');
    expect(canCancelReservation(new Date(now.getTime() + 24 * 60 * 60 * 1000), now)).toBe(true);
  });

  it('rejects reservation cancellation with less than 24 hours remaining', () => {
    const now = new Date('2027-01-01T10:00:00.000Z');
    expect(canCancelReservation(new Date(now.getTime() + 24 * 60 * 60 * 1000 - 1), now)).toBe(false);
  });
});

describe('Asia/Kolkata date-time conversion', () => {
  it('converts Indian local time to the correct UTC instant', () => {
    expect(indiaLocalDateTimeToUtc('2027-01-15T19:30').toISOString()).toBe('2027-01-15T14:00:00.000Z');
  });

  it('rejects impossible calendar dates and invalid clock times', () => {
    expect(() => indiaLocalDateTimeToUtc('2027-02-30T19:30')).toThrow();
    expect(() => indiaLocalDateTimeToUtc('2027-01-15T24:00')).toThrow();
  });
});
