import React from 'react';
import { IonBadge } from '@ionic/react';
import type { BMIResult, TargetWeight } from './types';
import { COLORS } from './constants';

interface BMICardProps {
  bmi: BMIResult;
  targetWeight?: TargetWeight;
  currentWeight?: number;
}

const cardStyle: React.CSSProperties = {
  background: 'transparent',
  borderRadius: 0,
  border: 'none',
  padding: 0,
  maxWidth: 480,
};

const bmiBarContainerStyle: React.CSSProperties = {
  position: 'relative',
  height: 14,
  borderRadius: 7,
  marginTop: 14,
  marginBottom: 10,
  background: 'linear-gradient(to right, #1890ff, #52c41a, #fa8c16, #ff4d4f)',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
};

const BMICard: React.FC<BMICardProps> = ({ bmi, targetWeight, currentWeight }) => {
  const bmiMin = 15;
  const bmiMax = 35;
  const clampedBmi = Math.max(bmiMin, Math.min(bmiMax, bmi.value));
  const markerPercent = ((clampedBmi - bmiMin) / (bmiMax - bmiMin)) * 100;

  const progressPercent = targetWeight && currentWeight
    ? Math.min(100, Math.max(0,
        ((currentWeight - targetWeight.max) / (targetWeight.min - targetWeight.max)) * 100
      ))
    : 0;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: '#999' }}>BMI指数</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#333', lineHeight: 1.2 }}>
            {bmi.value.toFixed(1)}
          </div>
        </div>
        <IonBadge
          color={bmi.category === 'underweight' ? 'primary' : bmi.category === 'normal' ? 'success' : bmi.category === 'overweight' ? 'warning' : 'danger'}
          style={{
            borderRadius: 6,
            fontSize: 14,
            padding: '4px 12px',
          }}
        >
          {bmi.label}
        </IonBadge>
      </div>

      {/* BMI gradient bar */}
      <div style={bmiBarContainerStyle}>
        <div
          style={{
            position: 'absolute',
            left: `${markerPercent}%`,
            top: -4,
            transform: 'translateX(-50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
            border: `3px solid ${bmi.color}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            zIndex: 1,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#bbb' }}>
        <span>15</span>
        <span>18.5</span>
        <span>24</span>
        <span>28</span>
        <span>35</span>
      </div>

      {/* Target weight section */}
      {targetWeight && currentWeight && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 10 }}>
            目标体重
          </div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
            {targetWeight.min} ~ {targetWeight.max} kg（推荐 {targetWeight.recommended} kg）
          </div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: 500 }}>当前进度</div>
          <div
            style={{
              height: 10,
              borderRadius: 5,
              background: '#f0f0f0',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                borderRadius: 5,
                background: progressPercent >= 100
                  ? 'linear-gradient(90deg, #52c41a 0%, #73d13d 100%)'
                  : 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4, textAlign: 'right', fontWeight: 500 }}>
            {currentWeight.toFixed(2)} kg
          </div>
        </div>
      )}
    </div>
  );
};

export default BMICard;