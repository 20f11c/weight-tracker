import React from 'react';
import * as echarts from 'echarts/core';
import { BarChart as EBarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import ReactECharts from 'echarts-for-react';
import type { DailyWeight, PeriodType } from './types';
import { COLORS } from './constants';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

echarts.use([EBarChart, GridComponent, TooltipComponent, CanvasRenderer]);

interface PeriodCompareChartProps {
  records: DailyWeight[];
  period: PeriodType;
  height?: number;
}

function groupByPeriod(records: DailyWeight[], period: PeriodType): { labels: string[]; averages: number[] } {
  if (!records.length) return { labels: [], averages: [] };

  if (period === 'week') {
    return {
      labels: records.map((r) => dayjs(r.date).format('MM/DD')),
      averages: records.map((r) => r.avg_weight_kg),
    };
  }

  const groups = new Map<string, number[]>();

  for (const r of records) {
    const d = dayjs(r.date);
    let key: string;
    if (period === 'month') {
      key = `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, '0')}`;
    } else {
      key = d.format('YYYY-MM');
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r.avg_weight_kg);
  }

  const sortedKeys = Array.from(groups.keys()).sort();
  const labels = sortedKeys.map((k) => {
    if (period === 'month') {
      const parts = k.split('-W');
      return `第${parseInt(parts[1], 10)}周`;
    }
    return dayjs(k + '-01').format('YYYY/MM');
  });
  const averages = sortedKeys.map((k) => {
    const vals = groups.get(k)!;
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
  });

  return { labels, averages };
}

const PeriodCompareChart: React.FC<PeriodCompareChartProps> = ({ records, period, height = 200 }) => {
  const { labels, averages } = groupByPeriod(records, period);

  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0];
        return `<b>${p.name}</b><br/>平均体重: ${p.value} kg`;
      },
    },
    grid: { left: 45, right: 16, top: 16, bottom: 24 },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { fontSize: 11, color: '#999', rotate: period === 'year' ? 45 : 0 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#eee' } },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { fontSize: 11, color: '#999' },
      splitLine: { lineStyle: { color: '#f5f5f5' } },
    },
    series: [
      {
        type: 'bar',
        data: averages,
        barMaxWidth: 32,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: COLORS.green },
            { offset: 1, color: COLORS.green + '60' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <ReactECharts echarts={echarts} option={option} style={{ height, width: '100%' }} />
    </div>
  );
};

export default PeriodCompareChart;