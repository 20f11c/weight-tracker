import dayjs from 'dayjs';
import type { BMIResult, BMICategory, TargetWeight, DailyWeight, DailyComparison } from './types';
import { BMI_STANDARDS, COLORS, AGE_GENDER_BMI_TABLE, IDEAL_WEIGHT_FORMULAS } from './constants';

/**
 * Calculate BMI value (round to 1 decimal)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Get BMI category using Chinese standards
 */
export function getBMICategory(bmi: number, age?: number): BMIResult {
  const isElderly = age !== undefined && age >= 65;
  const standard = isElderly ? BMI_STANDARDS.elderly : BMI_STANDARDS.adult;

  let category: BMICategory;
  let label: string;
  let color: string;

  if (bmi < standard.underweight) {
    category = 'underweight';
    label = '偏瘦';
    color = COLORS.blue;
  } else if (bmi <= standard.normal_max) {
    category = 'normal';
    label = '正常';
    color = COLORS.green;
  } else if (bmi <= standard.overweight_max) {
    category = 'overweight';
    label = '超重';
    color = COLORS.orange;
  } else {
    category = 'obese';
    label = '肥胖';
    color = COLORS.red;
  }

  return { value: bmi, category, label, color };
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  const birth = dayjs(birthDate);
  const today = dayjs();
  let age = today.year() - birth.year();
  const monthDiff = today.month() - birth.month();
  if (monthDiff < 0 || (monthDiff === 0 && today.date() < birth.date())) {
    age--;
  }
  return age;
}

/**
 * Calculate target weight range
 */
export function getTargetWeight(heightCm: number, age?: number): TargetWeight {
  const isElderly = age !== undefined && age >= 65;
  const standard = isElderly ? BMI_STANDARDS.elderly : BMI_STANDARDS.adult;
  const heightM = heightCm / 100;
  const h2 = heightM * heightM;

  return {
    min: Math.round(standard.normal_min * h2 * 10) / 10,
    max: Math.round(standard.normal_max * h2 * 10) / 10,
    recommended: Math.round(standard.target_bmi * h2 * 10) / 10,
  };
}

/**
 * Smart target weight recommendation considering age, gender, and height.
 * Returns recommended weight, healthy range, and explanation.
 */
export function getSmartTargetWeight(
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): TargetWeight & { explanation: string } {
  // Find age group
  const ageGroup = AGE_GENDER_BMI_TABLE.find(
    g => age >= g.ageMin && age <= g.ageMax
  ) ?? AGE_GENDER_BMI_TABLE[AGE_GENDER_BMI_TABLE.length - 1];

  const targetBMI = gender === 'male' ? ageGroup.maleTargetBMI : ageGroup.femaleTargetBMI;

  // BMI-based range
  const isElderly = age >= 65;
  const standard = isElderly ? BMI_STANDARDS.elderly : BMI_STANDARDS.adult;
  const heightM = heightCm / 100;
  const h2 = heightM * heightM;

  const bmiMin = Math.round(standard.normal_min * h2 * 10) / 10;
  const bmiMax = Math.round(standard.normal_max * h2 * 10) / 10;
  const bmiRecommended = Math.round(targetBMI * h2 * 10) / 10;

  // Broca formula
  const formula = IDEAL_WEIGHT_FORMULAS[gender];
  const brocaWeight = Math.round((heightCm - formula.base) * formula.factor * 10) / 10;

  // Final recommended = weighted average of BMI-based and Broca formula (60% BMI, 40% Broca)
  const recommended = Math.round((bmiRecommended * 0.6 + brocaWeight * 0.4) * 10) / 10;

  // Generate explanation
  const ageLabel = age >= 65 ? '65岁以上' : `${ageGroup.ageMin}-${ageGroup.ageMax}岁`;
  const genderLabel = gender === 'male' ? '男性' : '女性';
  const explanation = `${ageLabel}${genderLabel}推荐BMI ${targetBMI}，结合身高 ${heightCm}cm 计算`;

  return {
    min: bmiMin,
    max: bmiMax,
    recommended,
    explanation,
  };
}

/**
 * Compare today vs yesterday using avg_weight_kg
 */
export function getDailyComparison(
  today: DailyWeight | null,
  yesterday: DailyWeight | null,
): DailyComparison {
  if (!today || !yesterday) {
    return { today, yesterday, change: null, direction: 'none' };
  }

  const change = Math.round((today.avg_weight_kg - yesterday.avg_weight_kg) * 10) / 10;

  let direction: 'up' | 'down' | 'same' | 'none';
  if (change > 0) direction = 'up';
  else if (change < 0) direction = 'down';
  else direction = 'same';

  return { today, yesterday, change, direction };
}