/**
 * Timezone utilities for São Paulo/Brazil (UTC-3)
 * 
 * Brazil (Brasília timezone) does not observe daylight saving time since 2019,
 * so we can safely use a fixed UTC-3 offset.
 */
import { TZDate } from "@date-fns/tz";
import { format as dateFnsFormat, isSameDay, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";

export const SAO_PAULO_TIMEZONE = "America/Sao_Paulo";
export const SAO_PAULO_OFFSET_HOURS = -3;
export const SAO_PAULO_OFFSET_MS = SAO_PAULO_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Get the date-fns locale based on locale string
 */
function getDateFnsLocale(locale?: string) {
  switch (locale) {
    case 'en':
      return enUS;
    case 'es':
      return es;
    case 'pt':
    default:
      return ptBR;
  }
}

/**
 * Converts a Date to São Paulo timezone
 * @param date - Date to convert (can be Date, string, or number)
 * @returns TZDate in São Paulo timezone
 */
export function toSaoPauloTime(date: Date | string | number): TZDate {
  const inputDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new TZDate(inputDate, SAO_PAULO_TIMEZONE);
}

/**
 * Creates a new TZDate in São Paulo timezone with specified hours/minutes
 * Useful for scheduling (e.g., user selects 14:00 in Brazil)
 * @param date - Base date
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @returns TZDate set to the specified time in São Paulo timezone
 */
export function createSaoPauloDateTime(date: Date, hours: number, minutes: number = 0): TZDate {
  const saoPauloDate = new TZDate(date, SAO_PAULO_TIMEZONE);
  saoPauloDate.setHours(hours, minutes, 0, 0);
  return saoPauloDate;
}

/**
 * Formats a date in São Paulo timezone
 * @param date - Date to format
 * @param formatStr - date-fns format string
 * @param locale - Locale for formatting ('pt', 'en', 'es')
 * @returns Formatted string in São Paulo timezone
 */
export function formatInSaoPaulo(
  date: Date | string | number,
  formatStr: string,
  locale?: string
): string {
  const saoPauloDate = toSaoPauloTime(date);
  return dateFnsFormat(saoPauloDate, formatStr, { locale: getDateFnsLocale(locale) });
}

/**
 * Gets the current date/time in São Paulo timezone
 * @returns TZDate representing "now" in São Paulo
 */
export function getCurrentSaoPauloDate(): TZDate {
  return new TZDate(new Date(), SAO_PAULO_TIMEZONE);
}

/**
 * Gets today's date string in São Paulo timezone (YYYY-MM-DD format)
 * @returns String in YYYY-MM-DD format
 */
export function getTodayInSaoPaulo(): string {
  const now = getCurrentSaoPauloDate();
  return dateFnsFormat(now, "yyyy-MM-dd");
}

/**
 * Checks if two dates are the same day in São Paulo timezone
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day in São Paulo
 */
export function isSameDayInSaoPaulo(
  date1: Date | string | number,
  date2: Date | string | number
): boolean {
  const sp1 = toSaoPauloTime(date1);
  const sp2 = toSaoPauloTime(date2);
  return isSameDay(sp1, sp2);
}

/**
 * Gets the start of day in São Paulo timezone
 * @param date - Date to get start of day for
 * @returns TZDate at 00:00:00 in São Paulo
 */
export function startOfDayInSaoPaulo(date: Date | string | number): TZDate {
  const spDate = toSaoPauloTime(date);
  return new TZDate(startOfDay(spDate), SAO_PAULO_TIMEZONE);
}

/**
 * Gets the end of day in São Paulo timezone
 * @param date - Date to get end of day for
 * @returns TZDate at 23:59:59.999 in São Paulo
 */
export function endOfDayInSaoPaulo(date: Date | string | number): TZDate {
  const spDate = toSaoPauloTime(date);
  return new TZDate(endOfDay(spDate), SAO_PAULO_TIMEZONE);
}

/**
 * Checks if a date is in the past (compared to current São Paulo time)
 * @param date - Date to check
 * @returns True if date is before current São Paulo time
 */
export function isPastInSaoPaulo(date: Date | string | number): boolean {
  const spDate = toSaoPauloTime(date);
  const now = getCurrentSaoPauloDate();
  return isBefore(spDate, now);
}

/**
 * Checks if a date is in the future (compared to current São Paulo time)
 * @param date - Date to check
 * @returns True if date is after current São Paulo time
 */
export function isFutureInSaoPaulo(date: Date | string | number): boolean {
  const spDate = toSaoPauloTime(date);
  const now = getCurrentSaoPauloDate();
  return isAfter(spDate, now);
}

/**
 * Gets hours since a given date in São Paulo timezone
 * @param date - Date to compare against
 * @returns Number of hours since the date
 */
export function hoursSinceInSaoPaulo(date: Date | string | number): number {
  const spDate = toSaoPauloTime(date);
  const now = getCurrentSaoPauloDate();
  return (now.getTime() - spDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Gets days since a given date in São Paulo timezone
 * @param date - Date to compare against
 * @returns Number of days since the date
 */
export function daysSinceInSaoPaulo(date: Date | string | number): number {
  const spDate = toSaoPauloTime(date);
  const now = getCurrentSaoPauloDate();
  return Math.floor((now.getTime() - spDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Gets a date N hours ago in São Paulo timezone
 * @param hours - Number of hours ago
 * @returns TZDate representing that time in São Paulo
 */
export function hoursAgoInSaoPaulo(hours: number): TZDate {
  const now = getCurrentSaoPauloDate();
  return new TZDate(new Date(now.getTime() - hours * 60 * 60 * 1000), SAO_PAULO_TIMEZONE);
}

/**
 * Gets a date N days ago in São Paulo timezone
 * @param days - Number of days ago
 * @returns TZDate representing that time in São Paulo
 */
export function daysAgoInSaoPaulo(days: number): TZDate {
  const now = getCurrentSaoPauloDate();
  return new TZDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000), SAO_PAULO_TIMEZONE);
}
