export const DB_NAME = 'weight-tracker-db';
export const DB_VERSION = 1;

export const BMI_STANDARDS = {
  adult: {
    underweight: 18.5,
    normal_min: 18.5,
    normal_max: 23.9,
    overweight_min: 24.0,
    overweight_max: 27.9,
    obese: 28.0,
    target_bmi: 21.0,
  },
  elderly: {
    underweight: 20.0,
    normal_min: 20.0,
    normal_max: 26.9,
    overweight_min: 27.0,
    overweight_max: 28.0,
    obese: 28.0,
    target_bmi: 23.0,
  },
} as const;

export const AGE_GENDER_BMI_TABLE = [
  { ageMin: 18, ageMax: 24, maleTargetBMI: 21.5, femaleTargetBMI: 20.5 },
  { ageMin: 25, ageMax: 34, maleTargetBMI: 22.0, femaleTargetBMI: 21.0 },
  { ageMin: 35, ageMax: 44, maleTargetBMI: 22.5, femaleTargetBMI: 21.5 },
  { ageMin: 45, ageMax: 54, maleTargetBMI: 23.0, femaleTargetBMI: 22.0 },
  { ageMin: 55, ageMax: 64, maleTargetBMI: 23.0, femaleTargetBMI: 22.5 },
  { ageMin: 65, ageMax: 200, maleTargetBMI: 23.0, femaleTargetBMI: 23.0 },
] as const;

export const IDEAL_WEIGHT_FORMULAS = {
  male: { base: 100, factor: 0.9 },    // (height - 100) × 0.9
  female: { base: 100, factor: 0.85 },  // (height - 100) × 0.85
} as const;

export const COLORS = {
  green: '#52c41a',
  greenLight: '#f6ffed',
  greenDark: '#389e0d',
  red: '#ff4d4f',
  redLight: '#fff1f0',
  orange: '#fa8c16',
  blue: '#1890ff',
} as const;