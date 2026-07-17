import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { PeriodType } from './types';

dayjs.extend(isoWeek);

/**
 * Format date as 'YYYY-MM-DD'
 */
export function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * Format date string as 'MM/DD' for display
 */
export function formatDisplayDate(dateStr: string): string {
  return dayjs(dateStr).format('MM/DD');
}

/**
 * Get today's date as 'YYYY-MM-DD'
 */
export function getToday(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * Get ISO 8601 week range (Monday-Sunday) for the week containing the given date.
 * ISO 8601: Monday is day 1, Sunday is day 7.
 * Note: ISO week may cross calendar year boundaries.
 */
export function getWeekRange(date: Date): { start: string; end: string } {
  const d = dayjs(date);
  const start = d.startOf('isoWeek');
  const end = d.endOf('isoWeek');
  return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
}

/**
 * Get first-last day of month
 */
export function getMonthRange(date: Date): { start: string; end: string } {
  const d = dayjs(date);
  return {
    start: d.startOf('month').format('YYYY-MM-DD'),
    end: d.endOf('month').format('YYYY-MM-DD'),
  };
}

/**
 * Get Jan 1 to Dec 31
 */
export function getYearRange(date: Date): { start: string; end: string } {
  const d = dayjs(date);
  return {
    start: d.startOf('year').format('YYYY-MM-DD'),
    end: d.endOf('year').format('YYYY-MM-DD'),
  };
}

/**
 * Count days between two dates (inclusive)
 */
export function getDaysBetween(start: string, end: string): number {
  const s = dayjs(start);
  const e = dayjs(end);
  return e.diff(s, 'day') + 1;
}

/**
 * ISO week number
 */
export function getWeekNumber(date: Date): number {
  return dayjs(date).isoWeek();
}

/**
 * Get the previous week/month/year date
 */
export function getPreviousPeriod(period: PeriodType, date: Date): Date {
  const d = dayjs(date);
  switch (period) {
    case 'week':
      return d.subtract(1, 'week').toDate();
    case 'month':
      return d.subtract(1, 'month').toDate();
    case 'year':
      return d.subtract(1, 'year').toDate();
  }
}

/**
 * Get the next week/month/year date
 */
export function getNextPeriod(period: PeriodType, date: Date): Date {
  const d = dayjs(date);
  switch (period) {
    case 'week':
      return d.add(1, 'week').toDate();
    case 'month':
      return d.add(1, 'month').toDate();
    case 'year':
      return d.add(1, 'year').toDate();
  }
}

/**
 * Get display label like "2026年第28周", "2026年7月", "2026年"
 */
export function getPeriodLabel(period: PeriodType, date: Date): string {
  const d = dayjs(date);
  switch (period) {
    case 'week':
      return `${d.isoWeekYear()}年第${d.isoWeek()}周`;
    case 'month':
      return `${d.year()}年${d.month() + 1}月`;
    case 'year':
      return `${d.year()}年`;
  }
}