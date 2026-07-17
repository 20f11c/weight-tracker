import { runSQL, querySQL } from './db-connection';
import type { UserProfile } from './types';

export async function getUserProfile(): Promise<UserProfile | null> {
  const rows = await querySQL('SELECT * FROM user_profile WHERE id = 1');
  if (!rows.length) return null;
  return rows[0] as UserProfile;
}

export async function createUserProfile(
  data: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
): Promise<UserProfile> {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await runSQL(
    `INSERT INTO user_profile (id, height_cm, initial_weight_kg, target_weight_kg, gender, birth_date, created_at, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
    [data.height_cm, data.initial_weight_kg, data.target_weight_kg, data.gender, data.birth_date, now, now]
  );
  const profile = await getUserProfile();
  if (!profile) throw new Error('Failed to create user profile');
  return profile;
}

export async function updateUserProfile(
  data: Partial<Pick<UserProfile, 'height_cm' | 'target_weight_kg'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (number | string | null)[] = [];
  if (data.height_cm !== undefined) {
    fields.push('height_cm = ?');
    values.push(data.height_cm);
  }
  if (data.target_weight_kg !== undefined) {
    fields.push('target_weight_kg = ?');
    values.push(data.target_weight_kg);
  }
  if (fields.length === 0) return;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  fields.push('updated_at = ?');
  values.push(now);
  await runSQL(`UPDATE user_profile SET ${fields.join(', ')} WHERE id = 1`, values);
}
