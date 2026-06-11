/**
 * Timezone utilities for São Paulo/Brazil (UTC-3) - Deno/Edge Functions version
 * 
 * Brazil (Brasília timezone) does not observe daylight saving time since 2019,
 * so we can safely use a fixed UTC-3 offset.
 */

export const SAO_PAULO_TIMEZONE = "America/Sao_Paulo";
export const SAO_PAULO_OFFSET_HOURS = -3;
export const SAO_PAULO_OFFSET_MS = SAO_PAULO_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Converts a UTC date to São Paulo local time
 * @param utcDate - Date in UTC
 * @returns Date object representing the same moment in São Paulo timezone
 */
export function toSaoPauloTime(utcDate: Date | string | number): Date {
  const date = typeof utcDate === 'string' || typeof utcDate === 'number' 
    ? new Date(utcDate) 
    : utcDate;
  // Add the offset to get São Paulo local time
  // UTC-3 means São Paulo is 3 hours behind UTC, so we subtract 3 hours
  return new Date(date.getTime() + SAO_PAULO_OFFSET_MS);
}

/**
 * Converts a São Paulo local time to UTC
 * @param saoPauloDate - Date in São Paulo timezone
 * @returns Date object in UTC
 */
export function fromSaoPauloToUTC(saoPauloDate: Date | string | number): Date {
  const date = typeof saoPauloDate === 'string' || typeof saoPauloDate === 'number' 
    ? new Date(saoPauloDate) 
    : saoPauloDate;
  return new Date(date.getTime() - SAO_PAULO_OFFSET_MS);
}

/**
 * Gets the current date/time in São Paulo timezone
 * @returns Date representing "now" in São Paulo
 */
export function getCurrentSaoPauloDate(): Date {
  return toSaoPauloTime(new Date());
}

/**
 * Gets today's date string in São Paulo timezone (YYYY-MM-DD format)
 * @returns String in YYYY-MM-DD format
 */
export function getTodayInSaoPaulo(): string {
  const now = getCurrentSaoPauloDate();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the start of today in São Paulo timezone as a UTC ISO string
 * @returns ISO string representing 00:00:00 São Paulo time in UTC
 */
export function getStartOfTodayInSaoPauloAsUTC(): string {
  const today = getTodayInSaoPaulo();
  // Create a date at midnight São Paulo time, then convert to UTC
  // Midnight São Paulo (UTC-3) = 03:00 UTC
  return `${today}T03:00:00.000Z`;
}

/**
 * Gets the end of today in São Paulo timezone as a UTC ISO string
 * @returns ISO string representing 23:59:59.999 São Paulo time in UTC
 */
export function getEndOfTodayInSaoPauloAsUTC(): string {
  const today = getTodayInSaoPaulo();
  // End of day São Paulo (UTC-3) = 02:59:59.999 UTC next day
  const parts = today.split('-');
  const date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]) + 1, 2, 59, 59, 999));
  return date.toISOString();
}

/**
 * Formats a date as YYYY-MM-DD HH:mm:ss in São Paulo timezone
 * @param date - Date to format
 * @returns Formatted string
 */
export function formatInSaoPaulo(date: Date | string | number, formatStr: string = 'full'): string {
  const spDate = toSaoPauloTime(date);
  
  const year = spDate.getUTCFullYear();
  const month = String(spDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(spDate.getUTCDate()).padStart(2, '0');
  const hours = String(spDate.getUTCHours()).padStart(2, '0');
  const minutes = String(spDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(spDate.getUTCSeconds()).padStart(2, '0');
  
  switch (formatStr) {
    case 'date':
      return `${day}/${month}/${year}`;
    case 'time':
      return `${hours}:${minutes}`;
    case 'datetime':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'iso-date':
      return `${year}-${month}-${day}`;
    case 'full':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
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
  
  return (
    sp1.getUTCFullYear() === sp2.getUTCFullYear() &&
    sp1.getUTCMonth() === sp2.getUTCMonth() &&
    sp1.getUTCDate() === sp2.getUTCDate()
  );
}

/**
 * Gets hours since a given date in São Paulo timezone
 * @param date - Date to compare against
 * @returns Number of hours since the date
 */
export function hoursSinceInSaoPaulo(date: Date | string | number): number {
  const inputDate = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  const now = new Date();
  return (now.getTime() - inputDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Gets days since a given date in São Paulo timezone
 * @param date - Date to compare against
 * @returns Number of days since the date
 */
export function daysSinceInSaoPaulo(date: Date | string | number): number {
  const inputDate = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  const now = new Date();
  return Math.floor((now.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Gets a date N hours ago
 * @param hours - Number of hours ago
 * @returns Date representing that time
 */
export function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

/**
 * Gets a date N days ago
 * @param days - Number of days ago
 * @returns Date representing that time
 */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * Gets the start of day for a given date in São Paulo timezone, returned as UTC
 * @param date - Date to get start of day for
 * @returns Date at 00:00:00 São Paulo time, expressed in UTC
 */
export function startOfDayInSaoPauloAsUTC(date: Date | string | number): Date {
  const spDate = toSaoPauloTime(date);
  const year = spDate.getUTCFullYear();
  const month = spDate.getUTCMonth();
  const day = spDate.getUTCDate();
  // Create midnight São Paulo and convert to UTC (add 3 hours)
  return new Date(Date.UTC(year, month, day, 3, 0, 0, 0));
}

/**
 * Checks if a date is before the current time
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  const inputDate = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  return inputDate.getTime() < Date.now();
}

/**
 * Checks if a date is after the current time
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
  const inputDate = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  return inputDate.getTime() > Date.now();
}

/**
 * Log helper that includes São Paulo timestamp
 * @param prefix - Log prefix
 * @param message - Message to log
 */
export function logWithSaoPauloTime(prefix: string, message: string): void {
  const now = formatInSaoPaulo(new Date(), 'datetime');
  console.log(`[${prefix}] [${now} BRT] ${message}`);
}
