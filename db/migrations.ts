import { db } from './sqlite';

export async function ensureMigrations(): Promise<void> {
  await db.init();

  // Create tasks table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      action_category INTEGER NOT NULL,
      priority INTEGER,
      smart_goal_id TEXT,
      updated_at_ms INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      dirty INTEGER NOT NULL DEFAULT 0,
      op TEXT
    )
  `);

  // Create indexes for performance
  await db.runAsync(`
    CREATE INDEX IF NOT EXISTS idx_tasks_updated 
    ON tasks(updated_at_ms DESC)
  `);

  await db.runAsync(`
    CREATE INDEX IF NOT EXISTS idx_tasks_flags 
    ON tasks(deleted, dirty)
  `);

  await db.runAsync(`
    CREATE INDEX IF NOT EXISTS idx_tasks_completed 
    ON tasks(completed)
  `);

  await db.runAsync(`
    CREATE INDEX IF NOT EXISTS idx_tasks_action_category 
    ON tasks(action_category)
  `);
}

export async function getDbVersion(): Promise<number> {
  const result = await db.getAsync<{ version: number }>(
    'SELECT version FROM sqlite_master WHERE type="table" AND name="db_version"'
  );
  return result?.version || 0;
}

export async function setDbVersion(version: number): Promise<void> {
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS db_version (version INTEGER)
  `);
  await db.runAsync('DELETE FROM db_version');
  await db.runAsync('INSERT INTO db_version (version) VALUES (?)', [version]);
}