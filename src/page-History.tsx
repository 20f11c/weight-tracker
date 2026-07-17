import React, { useEffect, useState, useMemo } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonLabel,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonItem,
  IonModal,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import dayjs from 'dayjs';
import { useWeightStore } from './useWeightStore';
import { STATUS_BAR_HEIGHT } from './App';
import { COLORS } from './constants';
import WeightInput from './comp-WeightInput';
import type { DailyWeight, WeightInput as WeightInputType } from './types';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function formatDateWithWeekday(dateStr: string): string {
  const d = dayjs(dateStr);
  return `${d.format('MM/DD')} ${WEEKDAYS[d.day()]}`;
}

interface RecordChange {
  change: number | null;
  direction: 'up' | 'down' | 'same' | 'none';
}

function calcChange(current: DailyWeight, previous: DailyWeight | null): RecordChange {
  if (!previous) return { change: null, direction: 'none' };
  const diff = Math.round((current.avg_weight_kg - previous.avg_weight_kg) * 10) / 10;
  if (diff > 0) return { change: diff, direction: 'up' };
  if (diff < 0) return { change: Math.abs(diff), direction: 'down' };
  return { change: 0, direction: 'same' };
}

// --- Styles ---
const pageStyle: React.CSSProperties = {
  minHeight: '100%',
  background: '#f5f5f5',
  paddingBottom: 80,
};

const listStyle: React.CSSProperties = {
  background: '#fff',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 18px',
  borderBottom: '1px solid #f2f2f2',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
};

const dateColStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#333',
  minWidth: 90,
};

const weightColStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const avgWeightStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#333',
  minWidth: 64,
  textAlign: 'right',
};

const subWeightStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#999',
  textAlign: 'right',
  lineHeight: 1.5,
};

const changeStyle = (direction: string): React.CSSProperties => {
  let color = '#999';
  let bg = '#f5f5f5';
  if (direction === 'up') { color = COLORS.red; bg = COLORS.redLight; }
  else if (direction === 'down') { color = COLORS.green; bg = COLORS.greenLight; }
  return {
    fontSize: 13,
    fontWeight: 600,
    color,
    minWidth: 56,
    textAlign: 'right',
    padding: '3px 8px',
    borderRadius: 6,
    background: bg,
  };
};

const emptyStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#bbb',
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 60,
};

const popupContentStyle: React.CSSProperties = {
  padding: '20px 20px 36px',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  background: '#fff',
};

const popupTitleStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 600,
  textAlign: 'center',
  marginBottom: 16,
  color: '#333',
};

// --- Component ---
const History: React.FC = () => {
  const { records, isLoading, loadRecords, deleteRecord, addOrUpdateRecord } = useWeightStore();
  const [presentToast] = useIonToast();
  const [editingRecord, setEditingRecord] = useState<DailyWeight | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Sort descending by date
  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [records],
  );

  const showToast = (message: string, isError = false) => {
    presentToast({
      message,
      duration: 2000,
      position: 'top',
      color: isError ? 'danger' : 'success',
    });
  };

  const handleDelete = async (id: number) => {
    await deleteRecord(id);
    showToast('已删除');
  };

  const handleEditSave = async (data: WeightInputType) => {
    setSaving(true);
    try {
      await addOrUpdateRecord(data);
      showToast('已更新');
      setEditingRecord(null);
    } catch {
      showToast('更新失败', true);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && records.length === 0) {
    return (
      <IonPage>
        <IonHeader style={{ paddingTop: STATUS_BAR_HEIGHT }}>
          <IonToolbar style={{ '--background': '#fff', '--color': '#333', '--border-color': 'transparent' } as React.CSSProperties}>
            <IonTitle>历史记录</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={loadingStyle}>
            <IonSpinner color={COLORS.green} />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (sortedRecords.length === 0) {
    return (
      <IonPage>
        <IonHeader style={{ paddingTop: STATUS_BAR_HEIGHT }}>
          <IonToolbar style={{ '--background': '#fff', '--color': '#333', '--border-color': 'transparent' } as React.CSSProperties}>
            <IonTitle>历史记录</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ position: 'relative' }}>
          <div style={emptyStyle}>
            <div style={{ fontSize: 56, marginBottom: 20, opacity: 0.6 }}>📋</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#999' }}>暂无记录</div>
            <div style={{ fontSize: 14, marginTop: 10, color: '#bbb' }}>去首页记录你的第一条体重记录吧</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader style={{ paddingTop: STATUS_BAR_HEIGHT }}>
        <IonToolbar style={{ '--background': '#fff', '--color': '#333', '--border-color': 'transparent' } as React.CSSProperties}>
          <IonTitle>历史记录</IonTitle>
          <IonButtons slot="end">
            <IonLabel style={{ fontSize: 13, color: '#999', paddingRight: 8 }}>
              共 {sortedRecords.length} 天
            </IonLabel>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList style={{ background: '#fff', borderRadius: 14, margin: '12px 16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {sortedRecords.map((record, index) => {
            // Compare with the next (older) record
            const previous = index < sortedRecords.length - 1 ? sortedRecords[index + 1] : null;
            const { change, direction } = calcChange(record, previous);

            const changeText =
              direction === 'up'
                ? `↑${change!.toFixed(1)}`
                : direction === 'down'
                  ? `↓${change!.toFixed(1)}`
                  : direction === 'same'
                    ? '—'
                    : '';

            return (
              <IonItemSliding key={record.id}>
                <IonItem
                  button
                  detail={false}
                  onClick={() => setEditingRecord(record)}
                  style={{
                    '--inner-padding-end': '0',
                    '--padding-start': '0',
                    '--inner-padding-start': '0',
                  } as React.CSSProperties}
                >
                  <div style={rowStyle}>
                    <div style={dateColStyle}>{formatDateWithWeekday(record.date)}</div>
                    <div style={weightColStyle}>
                      <div>
                        <div style={avgWeightStyle}>{record.avg_weight_kg.toFixed(1)}</div>
                        <div style={subWeightStyle}>
                          早 {record.morning_weight_kg != null ? record.morning_weight_kg.toFixed(1) : '--'} / 晚 {record.evening_weight_kg != null ? record.evening_weight_kg.toFixed(1) : '--'}
                        </div>
                      </div>
                      <div style={changeStyle(direction)}>{changeText}</div>
                    </div>
                  </div>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption
                    color="danger"
                    onClick={() => handleDelete(record.id)}
                  >
                    删除
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            );
          })}
        </IonList>

        {/* Edit popup */}
        <IonModal
          isOpen={!!editingRecord}
          onDidDismiss={() => setEditingRecord(null)}
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75]}
        >
          <div style={popupContentStyle}>
            <div style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: '#e0e0e0',
              margin: '0 auto 16px',
            }} />
            <div style={popupTitleStyle}>编辑记录</div>
            {editingRecord && (
              <WeightInput
                onSubmit={handleEditSave}
                initialValues={{
                  date: editingRecord.date,
                  morning_weight_kg: editingRecord.morning_weight_kg ?? null,
                  evening_weight_kg: editingRecord.evening_weight_kg ?? null,
                  note: editingRecord.note || undefined,
                }}
                loading={saving}
              />
            )}
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default History;
