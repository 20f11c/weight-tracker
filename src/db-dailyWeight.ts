import { runSQL, querySQL } from './db-connection';
import type { DailyWeight, WeightInput } from './types';

export async function getDailyWeight(date: string): Promise<DailyWeight | null> {
  const rows = await querySQL('SELECT * FROM daily_weight WHERE date = ?', [date]);
  if (!rows.length) return null;
  return rows[0] as DailyWeight;
}

export async function getWeightRange(startDate: string, endDate: string): Promise<DailyWeight[]> {
  const rows = await querySQL(
    'SELECT * FROM daily_weight WHERE date >= ? AND date <= ? ORDER BY date ASC',
    [startDate, endDate]
  );
  return rows as DailyWeight[];
}

export async function getLatestRecords(limit: number): Promise<DailyWeight[]> {
  const rows = await querySQL('SELECT * FROM daily_weight ORDER BY date DESC LIMIT ?', [limit]);
  return rows as DailyWeight[];
}

export async function upsertDailyWeight(data: WeightInput): Promise<DailyWeight> {
  let avgWeight: number;
  if (data.morning_weight_kg != null && data.evening_weight_kg != null) {
    avgWeight = Math.round(((data.morning_weight_kg + data.evening_weight_kg) / 2) * 100) / 100;
  } else if (data.morning_weight_kg != null) {
    avgWeight = Math.round(data.morning_weight_kg * 100) / 100;
  } else if (data.evening_weight_kg != null) {
    avgWeight = Math.round(data.evening_weight_kg * 100) / 100;
  } else {
    throw new Error('At least one weight must be provided');
  }
  const note = data.note ?? null;
  const morningVal = data.morning_weight_kg;
  const eveningVal = data.evening_weight_kg;
  await runSQL(
    `INSERT OR REPLACE INTO daily_weight (date, morning_weight_kg, evening_weight_kg, avg_weight_kg, note)
     VALUES (?, ?, ?, ?, ?)`,
    [data.date, morningVal, eveningVal, avgWeight, note]
  );
  const record = await getDailyWeight(data.date);
  if (!record) throw new Error('Failed to upsert daily weight');
  return record;
}

export async function deleteDailyWeight(id: number): Promise<void> {
  await runSQL('DELETE FROM daily_weight WHERE id = ?', [id]);
}

export async function getAllRecords(): Promise<DailyWeight[]> {
  const rows = await querySQL('SELECT * FROM daily_weight ORDER BY date DESC');
  return rows as DailyWeight[];
}

export async function getRecordCount(): Promise<number> {
  const rows = await querySQL('SELECT COUNT(*) as cnt FROM daily_weight');
  if (!rows.length) return 0;
  return rows[0].cnt as number;
}
