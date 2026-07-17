import React, { useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonModal,
  useIonToast,
} from '@ionic/react';
import { settingsOutline } from 'ionicons/icons';
import { STATUS_BAR_HEIGHT } from './App';
import BMICard from './comp-BMICard';
import WeightInput from './comp-WeightInput';
import { useUserStore } from './useUserStore';
import { useWeightStore } from './useWeightStore';
import { calculateBMI, getBMICategory, getSmartTargetWeight, calculateAge } from './utils-bmi';
import { COLORS } from './constants';
import type { WeightInput as WeightInputType } from './types';

const pageStyle: React.CSSProperties = {
  minHeight: '100%',
  background: '#f5f5f5',
  paddingBottom: 80,
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 14,
  padding: 18,
  margin: '0 16px 14px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#333',
  marginBottom: 14,
  letterSpacing: '0.3px',
};

const Home: React.FC = () => {
  const history = useHistory();
  const { user } = useUserStore();
  const { todayRecord, yesterdayRecord, records, loadRecords, addOrUpdateRecord } =
    useWeightStore();
  const [presentToast] = useIonToast();

  const [popupMode, setPopupMode] = useState<'morning' | 'evening' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const bmiResult = useMemo(() => {
    if (!user) return null;
    let weight: number | null = null;
    if (todayRecord) {
      weight = todayRecord.avg_weight_kg;
    } else if (records.length > 0) {
      weight = records[records.length - 1].avg_weight_kg;
    }
    if (!weight) return null;
    const bmiValue = calculateBMI(weight, user.height_cm);
    const age = calculateAge(user.birth_date);
    return getBMICategory(bmiValue, age);
  }, [user, todayRecord, records]);

  const targetWeight = useMemo(() => {
    if (!user) return null;
    const age = calculateAge(user.birth_date);
    return getSmartTargetWeight(user.height_cm, age, user.gender);
  }, [user]);

  const currentWeight = useMemo(() => {
    if (todayRecord) return todayRecord.avg_weight_kg;
    if (records.length > 0) return records[records.length - 1].avg_weight_kg;
    return undefined;
  }, [todayRecord, records]);

  const comparison = useMemo(() => {
    if (!todayRecord || !yesterdayRecord) {
      return { change: null, direction: 'none' as const };
    }
    const change = Math.round((todayRecord.avg_weight_kg - yesterdayRecord.avg_weight_kg) * 10) / 10;
    let direction: 'up' | 'down' | 'same' | 'none';
    if (change > 0) direction = 'up';
    else if (change < 0) direction = 'down';
    else direction = 'same';
    return { change, direction };
  }, [todayRecord, yesterdayRecord]);

  const targetProgress = useMemo(() => {
    if (!user || !targetWeight || !currentWeight) return null;
    const target = user.target_weight_kg ?? targetWeight.recommended;
    const initial = user.initial_weight_kg;
    const remaining = Math.round((currentWeight - target) * 10) / 10;
    const totalRange = Math.abs(initial - target);
    const done = totalRange > 0 ? Math.min(100, Math.max(0, ((initial - currentWeight) / totalRange) * 100)) : 0;
    return { current: currentWeight, target, remaining, percent: done };
  }, [user, targetWeight, currentWeight]);

  const showToast = (message: string, isError = false) => {
    presentToast({
      message,
      duration: 2000,
      position: 'top',
      color: isError ? 'danger' : 'success',
    });
  };

  const handleSubmit = async (data: WeightInputType) => {
    setSubmitting(true);
    try {
      await addOrUpdateRecord(data);
      setPopupMode(null);
      showToast('\u8BB0\u5F55\u6210\u529F');
    } catch (err) {
      console.error('Submit error:', err);
      showToast('\u8BB0\u5F55\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5', true);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComparison = () => {
    if (!yesterdayRecord) {
      return <div style={{ fontSize: 13, color: '#999' }}>{'\u6682\u65E0\u6628\u65E5\u6570\u636E'}</div>;
    }
    if (!todayRecord) {
      return <div style={{ fontSize: 13, color: '#999' }}>{'\u4ECA\u65E5\u5C1A\u672A\u8BB0\u5F55\uFF0C\u65E0\u6CD5\u5BF9\u6BD4'}</div>;
    }
    const { change, direction } = comparison;
    if (direction === 'same') {
      return (
        <div style={{ fontSize: 15, color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
          {'\u8F83\u6628\u65E5'} <span style={{ fontWeight: 600 }}>{'\u2014 \u6301\u5E73'}</span>
        </div>
      );
    }
    const isDown = direction === 'down';
    const arrow = isDown ? '\u2193' : '\u2191';
    const arrowColor = isDown ? COLORS.green : COLORS.red;
    return (
      <div style={{ fontSize: 15, color: '#333', display: 'flex', alignItems: 'center', gap: 4 }}>
        {'\u8F83\u6628\u65E5'}{' '}
        <span style={{ fontWeight: 700, color: arrowColor }}>
          {arrow} {Math.abs(change!).toFixed(2)} kg
        </span>
      </div>
    );
  };

  return (
    <IonPage>
      <IonHeader style={{ paddingTop: STATUS_BAR_HEIGHT }}>
        <IonToolbar style={{ '--background': '#fff', '--color': '#333', '--border-color': 'transparent' } as React.CSSProperties}>
          <IonTitle>轻体记录</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/settings')}>
              <IonIcon icon={settingsOutline} style={{ fontSize: 22 }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '12px 0' }}>
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>{'\u4ECA\u65E5\u4F53\u91CD'}</div>
            {todayRecord ? (
              <>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      flex: 1,
                      background: '#f8f9fa',
                      borderRadius: 12,
                      padding: '16px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setPopupMode('morning')}
                  >
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: 500 }}>早晨体重</div>
                    {todayRecord.morning_weight_kg != null ? (
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#333' }}>
                        {todayRecord.morning_weight_kg.toFixed(2)}
                        <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}> kg</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 28, color: '#ccc' }}>+</div>
                    )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: '#f8f9fa',
                      borderRadius: 12,
                      padding: '16px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setPopupMode('evening')}
                  >
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: 500 }}>晚间体重</div>
                    {todayRecord.evening_weight_kg != null ? (
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#333' }}>
                        {todayRecord.evening_weight_kg.toFixed(2)}
                        <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}> kg</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 28, color: '#ccc' }}>+</div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
                  {'\u65E5\u5747\u4F53\u91CD\uFF1A'}<strong style={{ color: '#333', fontSize: 15 }}>{todayRecord.avg_weight_kg.toFixed(2)} kg</strong>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                <div
                  style={{
                    flex: 1,
                    background: '#f8f9fa',
                    borderRadius: 12,
                    padding: '16px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px dashed #c8e6c0',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setPopupMode('morning')}
                >
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: 500 }}>早晨体重</div>
                  <div style={{ fontSize: 36, color: '#52c41a', fontWeight: 300, lineHeight: 1 }}>+</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: '#f8f9fa',
                    borderRadius: 12,
                    padding: '16px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px dashed #c8e6c0',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setPopupMode('evening')}
                >
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: 500 }}>晚间体重</div>
                  <div style={{ fontSize: 36, color: '#52c41a', fontWeight: 300, lineHeight: 1 }}>+</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f6ffed 0%, #e8f8d6 100%)', border: '1px solid #d9f0c3' }}>
            {renderComparison()}
          </div>

          {bmiResult && (
            <div style={cardStyle}>
              <BMICard bmi={bmiResult} targetWeight={targetWeight ?? undefined} currentWeight={currentWeight} />
            </div>
          )}

          {targetProgress && (
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{'\u76EE\u6807\u8FDB\u5EA6'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 8 }}>
                <span>{'\u5F53\u524D'} <strong style={{ color: '#333' }}>{targetProgress.current.toFixed(2)} kg</strong></span>
                <span>{'\u76EE\u6807'} <strong style={{ color: '#333' }}>{targetProgress.target.toFixed(2)} kg</strong></span>
              </div>
              <div
                style={{
                  height: 12,
                  borderRadius: 6,
                  background: '#f0f0f0',
                  overflow: 'hidden',
                  marginBottom: 8,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, targetProgress.percent))}%`,
                    height: '100%',
                    borderRadius: 6,
                    background: 'linear-gradient(90deg, #52c41a 0%, #73d13d 100%)',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
                {targetProgress.remaining > 0
                  ? `\u8FD8\u9700\u51CF\u91CD ${targetProgress.remaining.toFixed(2)} kg`
                  : targetProgress.remaining < 0
                    ? `\u5DF2\u8D85\u6807 ${Math.abs(targetProgress.remaining).toFixed(2)} kg`
                    : '\u5DF2\u8FBE\u6210\u76EE\u6807 \uD83C\uDF89'}
              </div>
            </div>
          )}
        </div>

        <IonModal
          isOpen={popupMode !== null}
          onDidDismiss={() => setPopupMode(null)}
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75]}
        >
          <div style={{ padding: '20px 20px 32px', background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <div style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: '#e0e0e0',
              margin: '0 auto 16px',
            }} />
            <div style={{ marginBottom: 16, textAlign: 'center', fontSize: 17, fontWeight: 600, color: '#333' }}>
              {popupMode === 'morning' ? '\u8BB0\u5F55\u65E9\u6668\u4F53\u91CD' : '\u8BB0\u5F55\u665A\u95F4\u4F53\u91CD'}
            </div>
            <WeightInput
              key={popupMode ?? 'none'}
              onSubmit={handleSubmit}
              loading={submitting}
              initialValues={
                todayRecord
                  ? {
                      date: todayRecord.date,
                      morning_weight_kg: todayRecord.morning_weight_kg ?? null,
                      evening_weight_kg: todayRecord.evening_weight_kg ?? null,
                      note: todayRecord.note ?? undefined,
                    }
                  : undefined
              }
              mode={popupMode ?? undefined}
            />
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
