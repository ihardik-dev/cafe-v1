import { describe, expect, it } from 'vitest';
import {
  formatInIST,
  toReservationInputFormat,
  kolkataLocalToUtcDate,
  isFutureKolkataTime,
} from './datetime';

describe('Asia/Kolkata datetime helpers', () => {
  it('formats a UTC instant into Asia/Kolkata timezone', () => {
    // 2027-01-15T14:00:00Z is 19:30 in Asia/Kolkata (UTC + 5:30)
    const utcString = '2027-01-15T14:00:00.000Z';
    const formatted = formatInIST(utcString, 'yyyy-MM-dd HH:mm');
    expect(formatted).toBe('2027-01-15 19:30');
  });

  it('generates the exact backend-compatible YYYY-MM-DDTHH:mm reservation format', () => {
    const d = new Date('2027-01-15T14:00:00.000Z');
    expect(toReservationInputFormat(d)).toBe('2027-01-15T19:30');
  });

  it('converts an Asia/Kolkata local string back to the correct UTC instant', () => {
    const utcDate = kolkataLocalToUtcDate('2027-01-15T19:30');
    expect(utcDate.toISOString()).toBe('2027-01-15T14:00:00.000Z');
  });

  it('correctly detects whether a date is in the future or past', () => {
    expect(isFutureKolkataTime('2099-01-01T10:00')).toBe(true);
    expect(isFutureKolkataTime('2020-01-01T10:00')).toBe(false);
  });
});
