import { runSQL, querySQL } from './db-connection';

export async function runMigrations(): Promise<void> {
  await runSQL(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      height_cm REAL NOT NULL,
      initial_weight_kg REAL NOT NULL,
      target_weight_kg REAL,
      gender TEXT CHECK(gender IN ('male', 'female')),
      birth_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS daily_weight (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      morning_weight_kg REAL,
      evening_weight_kg REAL,
      avg_weight_kg REAL NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  // Migration: ensure morning_weight_kg and evening_weight_kg allow NULL
  // (old versions had NOT NULL constraint which breaks single-time-of-day entry)
  try {
    const cols = await querySQL('PRAGMA table_info(daily_weight)');
    if (cols.length > 0) {
      // cols are objects: {cid, name, type, notnull, dflt_value, pk}
      const morningCol = cols.find((r: any) => r.name === 'morning_weight_kg');
      const eveningCol = cols.find((r: any) => r.name === 'evening_weight_kg');
      // notnull: 1 = NOT NULL, 0 = nullable
      if ((morningCol && morningCol.notnull === 1) || (eveningCol && eveningCol.notnull === 1)) {
        // Recreate table with nullable columns
        await runSQL(`CREATE TABLE daily_weight_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          morning_weight_kg REAL,
          evening_weight_kg REAL,
          avg_weight_kg REAL NOT NULL,
          note TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )`);
        await runSQL(`INSERT INTO daily_weight_new SELECT * FROM daily_weight`);
        await runSQL(`DROP TABLE daily_weight`);
        await runSQL(`ALTER TABLE daily_weight_new RENAME TO daily_weight`);
        await runSQL(`CREATE INDEX IF NOT EXISTS idx_daily_weight_date ON daily_weight(date)`);
        await runSQL(`CREATE INDEX IF NOT EXISTS idx_daily_weight_date_avg ON daily_weight(date, avg_weight_kg)`);
        console.log('Migration: daily_weight table recreated with nullable weight columns');
      }
    }
  } catch (e) {
    console.error('Migration check failed:', e);
  }

  await runSQL(`CREATE INDEX IF NOT EXISTS idx_daily_weight_date ON daily_weight(date);`);
  await runSQL(`CREATE INDEX IF NOT EXISTS idx_daily_weight_date_avg ON daily_weight(date, avg_weight_kg);`);
}
