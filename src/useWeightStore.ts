import { create } from 'zustand';
import dayjs from 'dayjs';
import type { DailyWeight, WeightInput, PeriodType, DailyComparison, PeriodStats } from './types';
import {
  getAllRecords,
  getLatestRecords,
  getDailyWeight,
  getWeightRange,
  upsertDailyWeight,
  deleteDailyWeight,
  getRecordCount as dbGetRecordCount,
} from './db-dailyWeight';
import { getToday, getWeekRange, getMonthRange, getYearRange } from './utils-dateHelper';
import { getDailyComparison } from './utils-bmi';
import { calculatePeriodStats } from './utils-statistics';

interface WeightStoreState {
  records: DailyWeight[];
  todayRecord: DailyWeight | null;
  yesterdayRecord: DailyWeight | null;
  isLoading: boolean;

  // Actions
  loadRecords: () => Promise<void>;
  loadRecentRecords: (limit?: number) => Promise<void>;
  getTodayAndYesterday: () => Promise<DailyComparison>;
  addOrUpdateRecord: (data: WeightInput) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  getPeriodRecords: (period: PeriodType, date: Date) => Promise<DailyWeight[]>;
  getPeriodStats: (period: PeriodType, date: Date) => Promise<PeriodStats>;
  getRecordCount: () => Promise<number>;
}

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

export const useWeightStore = create<WeightStoreState>((set, get) => ({
  records: [],
  todayRecord: null,
  yesterdayRecord: null,
  isLoading: false,

  loadRecords: async () => {
    set({ isLoading: true });
    try {
      const records = await getAllRecords();
      const today = getToday();
      const yesterday = dayjs(today).subtract(1, 'day').format('YYYY-MM-DD');

      const todayRecord = records.find((r) => r.date === today) ?? null;
      const yesterdayRecord = records.find((r) => r.date === yesterday) ?? null;

      set({ records, todayRecord, yesterdayRecord });
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadRecentRecords: async (limit: number = 30) => {
    set({ isLoading: true });
    try {
      const records = await getLatestRecords(limit);
      set({ records });
    } catch (error) {
      console.error('Failed to load recent records:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getTodayAndYesterday: async (): Promise<DailyComparison> => {
    try {
      const today = getToday();
      const yesterday = dayjs(today).subtract(1, 'day').format('YYYY-MM-DD');

      const todayRecord = await getDailyWeight(today);
      const yesterdayRecord = await getDailyWeight(yesterday);

      set({ todayRecord, yesterdayRecord });

      return getDailyComparison(todayRecord, yesterdayRecord);
    } catch (error) {
      console.error('Failed to get today and yesterday:', error);
      return getDailyComparison(null, null);
    }
  },

  addOrUpdateRecord: async (data: WeightInput) => {
    set({ isLoading: true });
    try {
      await upsertDailyWeight(data);
      await get().loadRecords();
    } catch (error) {
      console.error('Failed to add or update record:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRecord: async (id: number) => {
    set({ isLoading: true });
    try {
      await deleteDailyWeight(id);
      await get().loadRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getPeriodRecords: async (period: PeriodType, date: Date): Promise<DailyWeight[]> => {
    try {
      const range = getPeriodRange(period, date);
      return await getWeightRange(range.start, range.end);
    } catch (error) {
      console.error('Failed to get period records:', error);
      return [];
    }
  },

  getPeriodStats: async (period: PeriodType, date: Date): Promise<PeriodStats> => {
    try {
      const range = getPeriodRange(period, date);
      const records = await getWeightRange(range.start, range.end);
      return calculatePeriodStats(records, period, date);
    } catch (error) {
      console.error('Failed to get period stats:', error);
      return calculatePeriodStats([], period, date);
    }
  },

  getRecordCount: async (): Promise<number> => {
    try {
      return await dbGetRecordCount();
    } catch (error) {
      console.error('Failed to get record count:', error);
      return 0;
    }
  },
}));