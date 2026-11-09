import { AppError } from './errors.js';

export const ORDER_CANCELLATION_WINDOW_MS = 60_000;
export const RESERVATION_CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1_000;
const INDIA_OFFSET = '+05:30';

/**
 * Accepts a cafe-local wall-clock value (`YYYY-MM-DDTHH:mm`) and interprets it
 * in Asia/Kolkata. India does not observe daylight-saving time.
 */
export function indiaLocalDateTimeToUtc(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new AppError(400, 'reservationDateTime must use YYYY-MM-DDTHH:mm in Asia/Kolkata');

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const calendarCheck = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() !== month - 1 ||
    calendarCheck.getUTCDate() !== day ||
    hour > 23 || minute > 59
  ) {
    throw new AppError(400, 'reservationDateTime is not a valid date and time');
  }

  const parsed = new Date(`${value}:00${INDIA_OFFSET}`);
  if (Number.isNaN(parsed.getTime())) throw new AppError(400, 'reservationDateTime is invalid');
  return parsed;
}

export function canCancelOrder(createdAt: Date, now: Date): boolean {
  const elapsed = now.getTime() - createdAt.getTime();
  return elapsed >= 0 && elapsed <= ORDER_CANCELLATION_WINDOW_MS;
}

export function canCancelReservation(reservationAt: Date, now: Date): boolean {
  return reservationAt.getTime() - now.getTime() >= RESERVATION_CANCELLATION_WINDOW_MS;
}
