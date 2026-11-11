import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

export const ASIA_KOLKATA_TZ = 'Asia/Kolkata';

/**
 * Formats a Date or UTC ISO string in India Standard Time (Asia/Kolkata).
 */
export function formatInIST(date: Date | string, formatPattern = 'dd MMM yyyy, hh:mm a'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(parsedDate, ASIA_KOLKATA_TZ, formatPattern);
}

/**
 * Converts a browser local Date to the Asia/Kolkata input string `YYYY-MM-DDTHH:mm`
 * required by the backend reservation schema.
 */
export function toReservationInputFormat(date: Date): string {
  return formatInTimeZone(date, ASIA_KOLKATA_TZ, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Parses an Asia/Kolkata local datetime string `YYYY-MM-DDTHH:mm` into a UTC Date instant.
 */
export function kolkataLocalToUtcDate(localDateTimeStr: string): Date {
  return fromZonedTime(localDateTimeStr, ASIA_KOLKATA_TZ);
}

/**
 * Returns current date/time converted to Asia/Kolkata zoned time.
 */
export function getCurrentISTDate(): Date {
  return toZonedTime(new Date(), ASIA_KOLKATA_TZ);
}

/**
 * Checks if a given `YYYY-MM-DDTHH:mm` (Asia/Kolkata) string represents a time in the future.
 */
export function isFutureKolkataTime(localDateTimeStr: string): boolean {
  const targetUtc = kolkataLocalToUtcDate(localDateTimeStr);
  return targetUtc.getTime() > Date.now();
}

/**
 * Formats a reservation string for display in UI, indicating IST explicitly.
 */
export function formatReservationDisplay(reservationDateTimeStr: string): string {
  try {
    const d = parseISO(reservationDateTimeStr);
    return `${format(d, 'dd MMM yyyy, hh:mm a')} IST`;
  } catch {
    return reservationDateTimeStr;
  }
}
