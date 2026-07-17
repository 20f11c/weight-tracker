import React from 'react';
import * as echarts from 'echarts/core';
import { LineChart as ELineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import ReactECharts from 'echarts-for-react';
import type { DailyWeight } from './types';
import { COLORS } from './constants';
import dayjs from 'dayjs';

echarts.use([ELineChart, GridComponent, TooltipComponent, MarkLineComponent, DataZoomComponent, CanvasRenderer]);

interface WeightChartProps {
  records: DailyWeight[];
  targetWeight?: number;
  height?: number;
}

const WeightChart: React.FC<WeightChartProps> = ({ records, targetWeight, height = 200 }) => {
  const dates = records.map((r) => dayjs(r.date).format('MM/DD'));
  const avgWeights = records.map((r) => r.avg_weight_kg);

  const markLineData = targetWeight
    ? [{ yAxis: targetWeight, name: '目标', label: { formatter: `目标 ${targetWeight} kg`, position: 'end' as const } }]
    : [];

  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0];
        const idx = p.dataIndex;
        const r = records[idx];
        if (!r) return '';
        return `<b>${r.date}</b><br/>早晨: ${r.morning_weight_kg != null ? r.morning_weight_kg.toFixed(2) : '--'} kg<br/>晚间: ${r.evening_weight_kg != null ? r.evening_weight_kg.toFixed(2) : '--'} kg<br/>平均: ${r.avg_weight_kg.toFixed(2)} kg`;
      },
    },
    grid: { left: 45, right: 16, top: 16, bottom: 12 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { fontSize: 11, color: '#999' },
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
        type: 'line',
        data: avgWeights,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: COLORS.green, width: 2 },
        itemStyle: { color: COLORS.green },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: COLORS.green + '40' },
            { offset: 1, color: COLORS.green + '05' },
          ]),
        },
        markLine: markLineData.length
          ? {
              data: markLineData,
              lineStyle: { type: 'dashed' as const, color: COLORS.orange },
              label: { color: COLORS.orange, fontSize: 11 },
            }
          : undefined,
      },
    ],
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <ReactECharts echarts={echarts} option={option} style={{ height, width: '100%' }} />
    </div>
  );
};

export default WeightChart;