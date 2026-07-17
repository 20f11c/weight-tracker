import { useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  useIonToast,
} from '@ionic/react';
import dayjs from 'dayjs';
import { useUserStore } from './useUserStore';
import { getSmartTargetWeight } from './utils-bmi';

const Setup = () => {
  const history = useHistory();
  const { setupUser, isLoading } = useUserStore();
  const [presentToast] = useIonToast();

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');

  const calculatedBirthDate = useMemo(() => {
    const a = parseInt(age);
    if (!a || a < 10 || a > 100) return null;
    return dayjs().subtract(a, 'year').format('YYYY-MM-DD');
  }, [age]);

  const previewTarget = useMemo(() => {
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!h || h < 100 || h > 250 || !a || a < 10 || a > 100 || !gender) return null;
    return getSmartTargetWeight(h, a, gender);
  }, [height, age, gender]);

  const showToast = (message: string, isError = true) => {
    presentToast({
      message,
      duration: 2000,
      position: 'top',
      color: isError ? 'danger' : 'success',
    });
  };

  const handleSubmit = async () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!height || isNaN(h)) {
      showToast('请输入身高');
      return;
    }
    if (h < 100 || h > 250) {
      showToast('身高范围：100-250cm');
      return;
    }
    if (!weight || isNaN(w)) {
      showToast('请输入当前体重');
      return;
    }
    if (w < 20 || w > 300) {
      showToast('体重范围：20-300kg');
      return;
    }
    const a = parseInt(age);
    if (!age || isNaN(a)) {
      showToast('请输入年龄');
      return;
    }
    if (a < 10 || a > 100) {
      showToast('年龄范围：10-100岁');
      return;
    }

    try {
      await setupUser({
        height_cm: h,
        initial_weight_kg: w,
        gender,
        birth_date: calculatedBirthDate!,
      });
      showToast('设置成功！', false);
      history.replace('/');
    } catch {
      showToast('设置失败，请重试');
    }
  };

  return (
    <IonPage>
      <IonContent scrollY style={{ '--background': '#f5f5f5' }}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logoCircle}>
              <span style={{ fontSize: 40 }}>{'🌿'}</span>
            </div>
            <h1 style={styles.title}>{'轻体记录'}</h1>
            <p style={styles.subtitle}>{'科学管理体重，从记录开始'}</p>
          </div>

          <div style={styles.form}>
            <IonItem style={styles.item}>
              <IonInput
                label={'身高 (cm)'}
                labelPlacement="floating"
                type="number"
                value={height}
                onIonInput={(e) => setHeight(e.detail.value as string)}
                placeholder={'请输入身高'}
                min={100}
                max={250}
              />
            </IonItem>

            <IonItem style={styles.item}>
              <IonInput
                label={'当前体重 (kg)'}
                labelPlacement="floating"
                type="number"
                value={weight}
                onIonInput={(e) => setWeight(e.detail.value as string)}
                placeholder={'请输入当前体重'}
                min={20}
                max={300}
              />
            </IonItem>

            <div style={styles.field}>
              <label style={styles.label}>{'性别'}</label>
              <div style={styles.genderRow}>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  style={{
                    ...styles.genderBtn,
                    ...(gender === 'male' ? styles.genderBtnActive : {}),
                  }}
                >
                  {'男'}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  style={{
                    ...styles.genderBtn,
                    ...(gender === 'female' ? styles.genderBtnActive : {}),
                  }}
                >
                  {'女'}
                </button>
              </div>
            </div>

            <IonItem style={styles.item}>
              <IonInput
                label={'年龄'}
                labelPlacement="floating"
                type="number"
                value={age}
                onIonInput={(e) => setAge(e.detail.value as string)}
                placeholder={'请输入年龄'}
                min={10}
                max={100}
              />
            </IonItem>
          </div>

          {previewTarget && (
            <div style={styles.previewCard}>
              <div style={styles.previewTitle}>
                {'🎯 为您推荐的目标体重'}
              </div>
              <div style={styles.previewValue}>
                {previewTarget.recommended.toFixed(1)}{' '}
                <span style={{ fontSize: 13, fontWeight: 400 }}>kg</span>
              </div>
              <div style={styles.previewRange}>
                {'健康范围：'}{previewTarget.min.toFixed(1)} - {previewTarget.max.toFixed(1)} kg
              </div>
              <div style={styles.previewExplanation}>
                {previewTarget.explanation}
              </div>
            </div>
          )}

          <div style={styles.footer}>
            <IonButton
              expand="block"
              size="large"
              disabled={isLoading}
              onClick={handleSubmit}
              style={styles.submitBtn}
            >
              {'开始使用'}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    padding: '0 16px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 36,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f6ffed 0%, #e8f8d6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0 4px 12px rgba(82,196,26,0.15)',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#52c41a',
    margin: '0 0 8px',
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    margin: 0,
    letterSpacing: '0.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    paddingTop: 8,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: 600,
    color: '#333',
    textAlign: 'left' as const,
  },
  item: {
    '--border-radius': '12px',
    '--background': '#fff',
    borderRadius: 12,
    border: '1px solid #e8e8e8',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  } as React.CSSProperties,
  genderRow: {
    display: 'flex',
    gap: 14,
  },
  genderBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    border: '2px solid #e8e8e8',
    backgroundColor: '#fff',
    fontSize: 17,
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    fontWeight: 500,
  },
  genderBtnActive: {
    backgroundColor: '#f6ffed',
    borderColor: '#52c41a',
    color: '#52c41a',
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(82,196,26,0.2)',
  },
  previewCard: {
    background: 'linear-gradient(135deg, #f6ffed 0%, #e8f8d6 100%)',
    borderRadius: 14,
    padding: '16px 18px',
    border: '1px solid #b7eb8f',
    margin: '16px 0',
    boxShadow: '0 2px 8px rgba(82,196,26,0.1)',
  },
  previewTitle: {
    fontSize: 14,
    color: '#52c41a',
    fontWeight: 600,
    marginBottom: 8,
  },
  previewValue: {
    fontSize: 26,
    fontWeight: 700,
    color: '#333',
  },
  previewRange: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  previewExplanation: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    padding: '28px 0 80px',
  },
  submitBtn: {
    '--border-radius': '28px',
    '--background': '#52c41a',
    '--background-hover': '#48ac17',
    '--background-activated': '#389e0d',
    height: 54,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '1px',
    boxShadow: '0 4px 12px rgba(82,196,26,0.35)',
  } as React.CSSProperties,
};

export default Setup;
