import type { DailyWeight, PeriodType, PeriodStats } from './types';
import { getWeekRange, getMonthRange, getYearRange, getDaysBetween, getToday } from './utils-dateHelper';

/**
 * Calculate linear regression trend
 */
export function calculateLinearTrend(weights: number[]): 'gaining' | 'stable' | 'losing' {
  if (weights.length < 2) return 'stable';

  const n = weights.length;
  // x values are 0, 1, 2, ... n-1
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += weights[i];
    sumXY += i * weights[i];
    sumX2 += i * i;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return 'stable';

  const slope = (n * sumXY - sumX * sumY) / denominator;

  if (slope > 0.05) return 'gaining';
  if (slope < -0.05) return 'losing';
  return 'stable';
}

/**
 * Format weight change like "+0.3 kg" or "-0.5 kg" or "--"
 */
export function formatWeightChange(change: number | null): string {
  if (change === null) return '--';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)} kg`;
}

/**
 * Get date range for a period
 */
function getPeriodRange(period: PeriodType, date: Date): { start: string; end: string } {
  switch (period) {
    case 'week':
      return getWeekRange(date);
    case 'month':
      return getMonthRange(date);
    case 'year':
      return getYearRange(date);
  }
}

/**
 * Main stats function: calculate statistics for a given period
 */
export function calculatePeriodStats(
  records: DailyWeight[],
  period: PeriodType,
  date: Date,
): PeriodStats {
  const range = getPeriodRange(period, date);
  const today = getToday();

  // Filter records within the period range
  const filtered = records
    .filter((r) => r.date >= range.start && r.date <= range.end)
    .sort((a, b) => a.date.localeCompare(b.date));

  // totalDays = actual days in the period up to today
  const effectiveEnd = today < range.end ? today : range.end;
  const totalDays = getDaysBetween(range.start, effectiveEnd);

  const dataPoints = filtered.length;

  if (dataPoints === 0) {
    return {
      period: range,
      dataPoints: 0,
      totalDays,
      avgWeight: 0,
      minWeight: 0,
      maxWeight: 0,
      startWeight: null,
      endWeight: null,
      change: null,
      trend: 'stable',
      records: [],
    };
  }

  const weights = filtered.map((r) => r.avg_weight_kg);
  const avgWeight = Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10;
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const startWeight = filtered[0].avg_weight_kg;
  const endWeight = filtered[filtered.length - 1].avg_weight_kg;
  const change = Math.round((endWeight - startWeight) * 10) / 10;
  const trend = calculateLinearTrend(weights);

  return {
    period: range,
    dataPoints,
    totalDays,
    avgWeight,
    minWeight,
    maxWeight,
    startWeight,
    endWeight,
    change,
    trend,
    records: filtered,
  };
}