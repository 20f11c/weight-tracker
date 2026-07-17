export interface UserProfile {
  id: number;
  height_cm: number;
  initial_weight_kg: number;
  target_weight_kg: number | null;
  gender: 'male' | 'female';
  birth_date: string; // ISO 8601
  created_at: string;
  updated_at: string;
}

export interface DailyWeight {
  id: number;
  date: string; // YYYY-MM-DD
  morning_weight_kg: number | null;
  evening_weight_kg: number | null;
  avg_weight_kg: number;
  note: string | null;
  created_at: string;
}

export interface WeightInput {
  date: string;
  morning_weight_kg: number | null;
  evening_weight_kg: number | null;
  note?: string;
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMIResult {
  value: number;
  category: BMICategory;
  label: string;
  color: string;
}

export interface TargetWeight {
  min: number;
  max: number;
  recommended: number;
  explanation?: string;
}

export type PeriodType = 'week' | 'month' | 'year';

export interface PeriodStats {
  period: { start: string; end: string };
  dataPoints: number;
  totalDays: number;
  avgWeight: number;
  minWeight: number;
  maxWeight: number;
  startWeight: number | null;
  endWeight: number | null;
  change: number | null;
  trend: 'gaining' | 'stable' | 'losing';
  records: DailyWeight[];
}

export interface DailyComparison {
  today: DailyWeight | null;
  yesterday: DailyWeight | null;
  change: number | null;
  direction: 'up' | 'down' | 'same' | 'none';
}