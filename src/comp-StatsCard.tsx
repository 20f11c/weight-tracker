import React from 'react';
import type { PeriodStats } from './types';
import { COLORS } from './constants';

interface StatsCardProps {
  stats: PeriodStats;
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  padding: '18px 20px',
  marginLeft: -16,
  marginRight: -16,
  borderBottom: '1px solid #f0f0f0',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 14,
};

const statItemStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '10px 0',
  background: '#fafafa',
  borderRadius: 10,
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#999',
  marginBottom: 6,
  fontWeight: 500,
};

const statValueStyle = (color: string): React.CSSProperties => ({
  fontSize: 24,
  fontWeight: 700,
  color,
});

const trendMap = {
  gaining: { symbol: '↑', color: COLORS.red, text: '上升' },
  losing: { symbol: '↓', color: COLORS.green, text: '下降' },
  stable: { symbol: '→', color: '#999', text: '平稳' },
};

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const trend = trendMap[stats.trend];
  const changeColor = stats.change !== null ? (stats.change <= 0 ? COLORS.green : COLORS.red) : '#999';

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 12, color: '#999' }}>
          已记录 {stats.dataPoints}/{stats.totalDays} 天
        </span>
        <span style={{ fontSize: 12, color: trend.color, fontWeight: 500 }}>
          {trend.symbol} {trend.text}
        </span>
      </div>

      <div style={gridStyle}>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>平均体重</div>
          <div style={statValueStyle('#333')}>{stats.avgWeight.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400 }}> kg</span></div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>最高体重</div>
          <div style={statValueStyle(COLORS.red)}>{stats.maxWeight.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400 }}> kg</span></div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>最低体重</div>
          <div style={statValueStyle(COLORS.green)}>{stats.minWeight.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400 }}> kg</span></div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>变化量</div>
          <div style={statValueStyle(changeColor)}>
            {stats.change !== null ? `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1)}` : '--'}
            <span style={{ fontSize: 12, fontWeight: 400 }}> kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;