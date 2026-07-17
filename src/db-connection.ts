import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { DB_NAME } from './constants';
import { runMigrations } from './db-migrations';

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: any; // SQLiteDBConnection

export async function initDatabase(): Promise<void> {
  if (db) return;

  // Check for existing connection consistency
  try {
    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

    if (ret.result && isConn) {
      db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    }
  } catch {
    db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
  }

  await db.open();
  await runMigrations();
}

export async function runSQL(statement: string, values?: any[]): Promise<void> {
  // db.run() handles single DML/DDL statements with optional bind params.
  // db.execute() expects ISQLiteParams[] (array of {statement, values}), NOT (string, values).
  await db.run(statement, values);
}

export async function querySQL(statement: string, values?: any[]): Promise<any[]> {
  const result = await db.query(statement, values);
  return result.values || [];
}

export async function runSQLWithChanges(
  statement: string,
  values?: any[]
): Promise<{ lastId: number; changes: number }> {
  const result = await db.run(statement, values);
  return {
    lastId: result.changes?.lastId ?? 0,
    changes: result.changes?.changes ?? 0,
  };
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
