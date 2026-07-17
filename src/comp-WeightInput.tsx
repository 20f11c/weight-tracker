import React, { useState, useEffect } from 'react';
import { IonInput, IonItem, useIonToast } from '@ionic/react';
import type { WeightInput as WeightInputType } from './types';
import { COLORS } from './constants';
import dayjs from 'dayjs';

interface WeightInputProps {
  onSubmit: (data: WeightInputType) => void;
  initialValues?: WeightInputType;
  loading?: boolean;
  mode?: 'morning' | 'evening';
}

const containerStyle: React.CSSProperties = {
  background: 'transparent',
  borderRadius: 0,
  border: 'none',
  padding: '8px 0',
  maxWidth: 480,
};

const fieldStyle: React.CSSProperties = {
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: '#333',
  marginBottom: 6,
  display: 'block',
};

const avgDisplayStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f6ffed 0%, #e8f8d6 100%)',
  borderRadius: 10,
  padding: '12px 14px',
  textAlign: 'center',
  fontSize: 15,
  color: COLORS.greenDark,
  border: '1px solid #d9f0c3',
  fontWeight: 500,
};

const WeightInput: React.FC<WeightInputProps> = ({ onSubmit, initialValues, loading, mode }) => {
  const [presentToast] = useIonToast();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialValues) {
      setDate(initialValues.date);
      setMorning(initialValues.morning_weight_kg != null ? String(initialValues.morning_weight_kg) : '');
      setEvening(initialValues.evening_weight_kg != null ? String(initialValues.evening_weight_kg) : '');
      setNote(initialValues.note || '');
    } else {
      setDate(dayjs().format('YYYY-MM-DD'));
      setMorning('');
      setEvening('');
      setNote('');
    }
  }, [initialValues]);

  const morningNum = parseFloat(morning);
  const eveningNum = parseFloat(evening);

  const showAvg = () => {
    if (mode === 'morning' && !isNaN(morningNum) && morningNum > 0) {
      const existingEvening = initialValues?.evening_weight_kg;
      if (existingEvening) {
        return ((morningNum + existingEvening) / 2).toFixed(2);
      }
      return morningNum.toFixed(2) + '\uFF08\u4EC5\u65E9\u6668\uFF09';
    }
    if (mode === 'evening' && !isNaN(eveningNum) && eveningNum > 0) {
      const existingMorning = initialValues?.morning_weight_kg;
      if (existingMorning) {
        return ((existingMorning + eveningNum) / 2).toFixed(2);
      }
      return eveningNum.toFixed(2) + '\uFF08\u4EC5\u665A\u95F4\uFF09';
    }
    if (!isNaN(morningNum) && !isNaN(eveningNum) && morningNum > 0 && eveningNum > 0) {
      return ((morningNum + eveningNum) / 2).toFixed(2);
    }
    if (!isNaN(morningNum) && morningNum > 0) return morningNum.toFixed(2);
    if (!isNaN(eveningNum) && eveningNum > 0) return eveningNum.toFixed(2);
    return null;
  };

  const avgWeight = showAvg();

  const handleSubmit = () => {
    try {
      const m = parseFloat(morning);
      const e = parseFloat(evening);

      let morningVal: number | null = null;
      let eveningVal: number | null = null;

      if (mode === 'morning') {
        if (!morning || isNaN(m) || m <= 0 || m >= 300) {
          presentToast({ message: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u65E9\u6668\u4F53\u91CD\uFF080-300 kg\uFF09', duration: 2000, position: 'top', color: 'danger' });
          return;
        }
        morningVal = m;
        eveningVal = initialValues?.evening_weight_kg ?? null;
      } else if (mode === 'evening') {
        if (!evening || isNaN(e) || e <= 0 || e >= 300) {
          presentToast({ message: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u665A\u996D\u540E\u4F53\u91CD\uFF080-300 kg\uFF09', duration: 2000, position: 'top', color: 'danger' });
          return;
        }
        eveningVal = e;
        morningVal = initialValues?.morning_weight_kg ?? null;
      } else {
        const mValid = morning !== '' && !isNaN(m) && m > 0 && m < 300;
        const eValid = evening !== '' && !isNaN(e) && e > 0 && e < 300;
        if (!mValid && !eValid) {
          presentToast({ message: '\u8BF7\u81F3\u5C11\u586B\u5199\u65E9\u6668\u4F53\u91CD\u6216\u665A\u996D\u540E\u4F53\u91CD', duration: 2000, position: 'top', color: 'danger' });
          return;
        }
        morningVal = mValid ? m : null;
        eveningVal = eValid ? e : null;
      }

      console.log('Submitting:', { date, morningVal, eveningVal, mode });
      onSubmit({
        date,
        morning_weight_kg: morningVal,
        evening_weight_kg: eveningVal,
        note: note.trim() || undefined,
      });
    } catch (err) {
      console.error('handleSubmit error:', err);
      presentToast({ message: '\u63D0\u4EA4\u51FA\u9519\uFF0C\u8BF7\u91CD\u8BD5', duration: 2000, position: 'top', color: 'danger' });
    }
  };

  return (
    <div style={containerStyle}>
      <div style={fieldStyle}>
        <span style={labelStyle}>{'\u65E5\u671F'}</span>
        <div style={{ fontSize: 14, color: '#666', padding: '6px 0' }}>{date}</div>
      </div>

      {(mode === 'morning' || !mode) && (
        <div style={fieldStyle}>
          <IonItem lines="none">
            <IonInput
              label={'\u65E9\u6668\u7A7A\u8179\u4F53\u91CD (kg)'}
              labelPlacement="floating"
              type="text"
              inputMode="decimal"
              placeholder={'\u4F8B\u5982 65.5'}
              value={morning}
              onIonInput={(e) => setMorning((e.detail.value as string) ?? '')}
              clearInput
            />
          </IonItem>
        </div>
      )}

      {(mode === 'evening' || !mode) && (
        <div style={fieldStyle}>
          <IonItem lines="none">
            <IonInput
              label={'\u665A\u996D\u540E\u4F53\u91CD (kg)'}
              labelPlacement="floating"
              type="text"
              inputMode="decimal"
              placeholder={'\u4F8B\u5982 66.2'}
              value={evening}
              onIonInput={(e) => setEvening((e.detail.value as string) ?? '')}
              clearInput
            />
          </IonItem>
        </div>
      )}

      {avgWeight && (
        <div style={{ ...fieldStyle }}>
          <div style={avgDisplayStyle}>
            {'\u5E73\u5747\u4F53\u91CD\uFF1A'}<strong>{avgWeight} kg</strong>
          </div>
        </div>
      )}

      <div style={fieldStyle}>
        <IonItem lines="none">
          <IonInput
            label={'\u5907\u6CE8\uFF08\u53EF\u9009\uFF09'}
            labelPlacement="floating"
            placeholder={'\u6DFB\u52A0\u5907\u6CE8...'}
            value={note}
            onIonInput={(e) => setNote((e.detail.value as string) ?? '')}
            clearInput
          />
        </IonItem>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        style={{
          width: '100%',
          height: 50,
          borderRadius: 12,
          border: 'none',
          background: loading ? '#ccc' : 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
          color: '#fff',
          fontSize: 17,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          boxShadow: loading ? 'none' : '0 3px 10px rgba(82,196,26,0.3)',
          letterSpacing: '0.5px',
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? '\u4FDD\u5B58\u4E2D...' : '\u4FDD\u5B58\u8BB0\u5F55'}
      </button>
    </div>
  );
};

export default WeightInput;
