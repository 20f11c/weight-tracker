import { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonModal,
  IonInput,
  IonItem,
  useIonToast,
} from '@ionic/react';
import { useUserStore } from './useUserStore';
import { useWeightStore } from './useWeightStore';
import { exportData } from './utils-exportData';
import { STATUS_BAR_HEIGHT } from './App';
import { COLORS } from './constants';
import { getSmartTargetWeight, calculateAge } from './utils-bmi';
import dayjs from 'dayjs';

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 14,
  margin: '10px 16px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#52c41a',
  padding: '16px 18px 8px',
  fontWeight: 600,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 18px',
  borderBottom: '1px solid #f2f2f2',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
};

const lastRowStyle: React.CSSProperties = {
  ...rowStyle,
  borderBottom: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 15,
  color: '#333',
  fontWeight: 500,
};

const valueStyle: React.CSSProperties = {
  fontSize: 15,
  color: '#999',
  fontWeight: 400,
};

const chevronStyle: React.CSSProperties = {
  marginLeft: 4,
  color: '#ccc',
  fontSize: 18,
};

const Settings = () => {
  const { user, updateHeight, updateTargetWeight } = useUserStore();
  const { records, loadRecords, getRecordCount } = useWeightStore();
  const [presentToast] = useIonToast();

  const [recordCount, setRecordCount] = useState(0);
  const [heightPopup, setHeightPopup] = useState(false);
  const [targetPopup, setTargetPopup] = useState(false);
  const [heightVal, setHeightVal] = useState('');
  const [targetVal, setTargetVal] = useState('');

  useEffect(() => {
    loadRecords().then(() => {
      getRecordCount().then(setRecordCount);
    });
  }, []);

  useEffect(() => {
    if (user) {
      setHeightVal(String(user.height_cm));
      setTargetVal(user.target_weight_kg != null ? String(user.target_weight_kg) : '');
    }
  }, [user]);

  const showToast = (message: string, isError = false) => {
    presentToast({
      message,
      duration: 2000,
      position: 'top',
      color: isError ? 'danger' : 'success',
    });
  };

  const handleSaveHeight = async () => {
    const val = parseFloat(heightVal);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter valid height', true);
      return;
    }
    await updateHeight(val);
    setHeightPopup(false);
    showToast('Height updated');
  };

  const handleSaveTarget = async () => {
    const val = parseFloat(targetVal);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter valid target weight', true);
      return;
    }
    await updateTargetWeight(val);
    setTargetPopup(false);
    showToast('Target weight updated');
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (!user) return;
    exportData(records, user, format);
    showToast(`Exported ${format.toUpperCase()} file`);
  };

  const genderText = user?.gender === 'female' ? '\u5973' : '\u7537';
  const birthDate = user?.birth_date ? dayjs(user.birth_date).format('YYYY-MM-DD') : '-';

  const smartTarget = (() => {
    if (!user) return null;
    const age = calculateAge(user.birth_date);
    return getSmartTargetWeight(user.height_cm, age, user.gender);
  })();

  return (
    <IonPage>
      <IonHeader style={{ paddingTop: STATUS_BAR_HEIGHT }}>
        <IonToolbar style={{ '--background': '#fff', '--color': '#333', '--border-color': 'transparent' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="" />
          </IonButtons>
          <IonTitle>{'\u8BBE\u7F6E'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={sectionTitleStyle}>{'\u4E2A\u4EBA\u4FE1\u606F'}</div>
        <div style={sectionStyle}>
          <div style={rowStyle} onClick={() => setHeightPopup(true)}>
            <span style={labelStyle}>{'\u8EAB\u9AD8'}</span>
            <span>
              <span style={valueStyle}>{user ? `${user.height_cm} cm` : '-'}</span>
              <span style={chevronStyle}>{'\u203A'}</span>
            </span>
          </div>
          <div style={rowStyle} onClick={() => setTargetPopup(true)}>
            <span style={labelStyle}>{'\u76EE\u6807\u4F53\u91CD'}</span>
            <span>
              <span style={valueStyle}>
                {user?.target_weight_kg != null ? `${user.target_weight_kg.toFixed(1)} kg` : '-'}
              </span>
              <span style={chevronStyle}>{'\u203A'}</span>
            </span>
          </div>
          {smartTarget && (
            <div style={{ padding: '10px 18px', fontSize: 12, color: '#666', background: '#f6ffed', borderTop: '1px solid #f0f0f0' }}>
              {`\uD83D\uDCA1 \u667A\u80FD\u63A8\u8350\uFF1A${smartTarget.recommended.toFixed(1)} kg\uFF08${smartTarget.explanation}\uFF09`}
            </div>
          )}
          <div style={rowStyle}>
            <span style={labelStyle}>{'\u6027\u522B'}</span>
            <span style={valueStyle}>{user ? genderText : '-'}</span>
          </div>
          <div style={lastRowStyle}>
            <span style={labelStyle}>{'\u51FA\u751F\u65E5\u671F'}</span>
            <span style={valueStyle}>{user ? birthDate : '-'}</span>
          </div>
        </div>

        <div style={sectionTitleStyle}>{'\u6570\u636E\u7BA1\u7406'}</div>
        <div style={sectionStyle}>
          <div style={rowStyle}>
            <span style={labelStyle}>{'\u8BB0\u5F55\u5929\u6570'}</span>
            <span style={valueStyle}>{recordCount} {'\u5929'}</span>
          </div>
          <div style={lastRowStyle}>
            <span style={labelStyle}>{'\u5BFC\u51FA\u6570\u636E'}</span>
            <span style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleExport('json')}
                style={{
                  padding: '5px 16px',
                  borderRadius: 20,
                  border: `1.5px solid ${COLORS.green}`,
                  background: 'transparent',
                  color: COLORS.green,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                style={{
                  padding: '5px 16px',
                  borderRadius: 20,
                  border: `1.5px solid ${COLORS.green}`,
                  background: 'transparent',
                  color: COLORS.green,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                CSV
              </button>
            </span>
          </div>
        </div>

        <div style={sectionTitleStyle}>{'\u5173\u4E8E'}</div>
        <div style={sectionStyle}>
          <div style={rowStyle}>
            <span style={labelStyle}>{'\u7248\u672C'}</span>
            <span style={valueStyle}>v1.3.12</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>BMI {'\u6807\u51C6'}</span>
            <span style={valueStyle}>{'\u4E2D\u56FD\u6807\u51C6 (WGOC)'}</span>
          </div>
          <div style={lastRowStyle}>
            <span style={labelStyle}>{'\u5E94\u7528\u540D\u79F0'}</span>
            <span style={valueStyle}>{'\u8F7B\u4F53\u8BB0\u5F55'}</span>
          </div>
        </div>

        <IonModal
          isOpen={heightPopup}
          onDidDismiss={() => setHeightPopup(false)}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.5]}
        >
          <div style={{ padding: '20px 24px 36px', background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e0e0e0', margin: '0 auto 20px' }} />
            <div style={{ marginBottom: 16, fontSize: 17, fontWeight: 600, color: '#333' }}>编辑身高</div>
            <IonItem>
              <IonInput
                label={'\u8EAB\u9AD8 (cm)'}
                labelPlacement="floating"
                type="number"
                value={heightVal}
                onIonInput={(e) => setHeightVal((e.detail.value as string) ?? '')}
                placeholder={'\u8BF7\u8F93\u5165\u8EAB\u9AD8 (cm)'}
              />
            </IonItem>
            <IonButton
              expand="block"
              onClick={handleSaveHeight}
              style={{ marginTop: 20, '--background': COLORS.green, '--border-radius': '12px', height: '48px', fontWeight: 600 } as React.CSSProperties}
            >
              保存
            </IonButton>
          </div>
        </IonModal>

        <IonModal
          isOpen={targetPopup}
          onDidDismiss={() => setTargetPopup(false)}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.5]}
        >
          <div style={{ padding: '20px 24px 36px', background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e0e0e0', margin: '0 auto 20px' }} />
            <div style={{ marginBottom: 16, fontSize: 17, fontWeight: 600, color: '#333' }}>编辑目标体重</div>
            <IonItem>
              <IonInput
                label={'\u76EE\u6807\u4F53\u91CD (kg)'}
                labelPlacement="floating"
                type="number"
                value={targetVal}
                onIonInput={(e) => setTargetVal((e.detail.value as string) ?? '')}
                placeholder={'\u8BF7\u8F93\u5165\u76EE\u6807\u4F53\u91CD (kg)'}
              />
            </IonItem>
            <IonButton
              expand="block"
              onClick={handleSaveTarget}
              style={{ marginTop: 20, '--background': COLORS.green, '--border-radius': '12px', height: '48px', fontWeight: 600 } as React.CSSProperties}
            >
              {'\u4FDD\u5B58'}
            </IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
