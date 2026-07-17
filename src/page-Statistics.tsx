import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import type { PeriodType, PeriodStats, DailyWeight } from './types';
import { useWeightStore } from './useWeightStore';
import { useUserStore } from './useUserStore';
import { getPreviousPeriod, getNextPeriod, getPeriodLabel } from './utils-dateHelper';
import { COLORS } from './constants';
import WeightChart from './comp-WeightChart';
import StatsCard from './comp-StatsCard';
import PeriodCompareChart from './comp-PeriodCompareChart';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

const periodTabs: { key: PeriodType; label: string }[] = [
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
];

const Statistics: React.FC = () => {
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [stats, setStats] = useState<PeriodStats | null>(null);
  const [records, setRecords] = useState<DailyWeight[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabBarWidth, setTabBarWidth] = useState<number>(0);

  const { getPeriodStats, getPeriodRecords } = useWeightStore();
  const user = useUserStore((s) => s.user);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        getPeriodStats(periodType, currentDate),
        getPeriodRecords(periodType, currentDate),
      ]);
      setStats(s);
      setRecords(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [periodType, currentDate, getPeriodStats, getPeriodRecords]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Measure available width for tab bar
  useEffect(() => {
    const measure = () => {
      const el = document.querySelector('.ion-content-scroll') || document.querySelector('ion-content');
      if (el) {
        const w = (el as HTMLElement).clientWidth;
        if (w > 0) {
          setTabBarWidth(w);
        }
      }
    };
    measure();
    const timer = setTimeout(measure, 200);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Force-apply active tab text color via DOM manipulation
  useEffect(() => {
    const applyColors = () => {
      const items = document.querySelectorAll('.period-tab-item');
      items.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.classList.contains('period-tab-item-active')) {
          htmlEl.style.setProperty('color', '#ffffff', 'important');
          htmlEl.style.setProperty('background-color', '#52c41a', 'important');
        } else {
          htmlEl.style.setProperty('color', '#52c41a', 'important');
          htmlEl.style.setProperty('background-color', 'transparent', 'important');
        }
      });
    };
    applyColors();
    const timer = setTimeout(applyColors, 100);
    return () => clearTimeout(timer);
  }, [periodType]);

  const isCurrentPeriod = (): boolean => {
    const now = new Date();
    switch (periodType) {
      case 'week':
        return dayjs(currentDate).isoWeek() === dayjs(now).isoWeek() && dayjs(currentDate).isoWeekYear() === dayjs(now).isoWeekYear();
      case 'month':
        return dayjs(currentDate).month() === dayjs(now).month() && dayjs(currentDate).year() === dayjs(now).year();
      case 'year':
        return dayjs(currentDate).year() === dayjs(now).year();
    }
  };

  const goPrev = () => setCurrentDate(getPreviousPeriod(periodType, currentDate));
  const goNext = () => setCurrentDate(getNextPeriod(periodType, currentDate));

  const targetWeight = user?.target_weight_kg ?? undefined;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#fff', '--color': '#333', '--border-color': 'transparent' }}>
          <IonTitle>统计分析</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Period Tabs - negative margin to extend full width */}
        <div style={styles.tabBarWrapper}>
          <div
            className="period-tab-bar"
            style={{
              ...styles.tabBar,
              width: tabBarWidth > 0 ? tabBarWidth - 32 : '100%',
            }}
          >
            {periodTabs.map((tab) => {
              const active = periodType === tab.key;
              return (
                <div
                  key={tab.key}
                  className={active ? 'period-tab-item period-tab-item-active' : 'period-tab-item'}
                  style={active
                    ? { ...styles.tabItem, ...styles.tabItemActive }
                    : styles.tabItem
                  }
                  onClick={() => {
                    setPeriodType(tab.key);
                    setCurrentDate(new Date());
                  }}
                >
                  {tab.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Date Navigator */}
        <div style={styles.navigator}>
          <div onClick={goPrev} style={styles.navArrow}>
            ◀
          </div>
          <div style={styles.navLabel}>{getPeriodLabel(periodType, currentDate)}</div>
          <div
            onClick={isCurrentPeriod() ? undefined : goNext}
            style={{
              ...styles.navArrow,
              ...(isCurrentPeriod() ? styles.navArrowDisabled : {}),
            }}
          >
            ▶
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>加载中...</div>
        ) : stats && stats.dataPoints === 0 ? (
          <div style={styles.empty}>该时段暂无数据</div>
        ) : stats ? (
          <div style={styles.content}>
            {/* Weight Trend Chart */}
            <div style={styles.card}>
              <div style={styles.sectionTitle}>体重趋势</div>
              <WeightChart records={records} targetWeight={targetWeight} height={200} />
            </div>

            {/* Period Compare Chart */}
            <div style={styles.card}>
              <div style={styles.sectionTitle}>周期对比</div>
              <PeriodCompareChart records={records} period={periodType} height={180} />
            </div>

            {/* Stats Card */}
            <StatsCard stats={stats} />

            {/* Record Info */}
            <div style={styles.recordInfo}>
              已记录 {stats.dataPoints}/{stats.totalDays} 天
            </div>
          </div>
        ) : null}
      </IonContent>
    </IonPage>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tabBarWrapper: {
    padding: '10px 16px',
    marginLeft: -16,
    marginRight: -16,
  },
  tabBar: {
    display: 'flex',
    border: `2px solid ${COLORS.green}`,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  tabItem: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '10px 0',
    fontSize: 15,
    fontWeight: 500,
    color: COLORS.green,
    backgroundColor: '#fff',
    cursor: 'pointer',
    userSelect: 'none' as const,
    transition: 'all 0.25s ease',
  },
  tabItemActive: {
    backgroundColor: COLORS.green,
    color: '#ffffff',
    fontWeight: 600,
  },
  navigator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: '14px 0',
  },
  navArrow: {
    fontSize: 16,
    cursor: 'pointer',
    color: COLORS.green,
    userSelect: 'none' as const,
    padding: '6px 10px',
    borderRadius: 8,
    background: '#f6ffed',
    transition: 'all 0.2s ease',
  },
  navArrowDisabled: {
    color: '#ccc',
    background: '#f5f5f5',
    cursor: 'not-allowed',
  },
  navLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: '#333',
    minWidth: 120,
    textAlign: 'center' as const,
  },
  loading: {
    textAlign: 'center' as const,
    padding: 40,
    color: '#999',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center' as const,
    padding: 60,
    color: '#999',
    fontSize: 14,
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
    padding: '0 0 24px',
  },
  card: {
    background: '#fff',
    padding: '18px 20px',
    marginLeft: -16,
    marginRight: -16,
    borderBottom: '1px solid #f0f0f0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#333',
    marginBottom: 10,
    letterSpacing: '0.3px',
  },
  recordInfo: {
    textAlign: 'center' as const,
    fontSize: 12,
    color: '#999',
    padding: '4px 0',
  },
};

export default Statistics;
