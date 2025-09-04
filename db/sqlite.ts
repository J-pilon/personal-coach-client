import * as SQLite from 'expo-sqlite';

// Promise-base wrapper for expo-sqlite
class SQLiteWrapper {
  private db: SQLite.SQLiteDatabase | null = null

  async init(dbName: string = 'personal-coach.db'): Promise<void> {
    this.db = await SQLite.openDatabaseAsync(dbName)
  }

  async runAsync(sql: string, params: any[] = []): Promise<SQLite.SQLiteRunResult> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    return await this.db.runAsync(sql, params);
  }

  async getAsync<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    const result = await this.db.getFirstAsync<T>(sql, params);
    return result || null;
  }

  async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    return await this.db.getAllAsync<T>(sql, params);
  }

  async transaction<T>(fn: (tx: SQLiteWrapper) => Promise<T>): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
  
    let result: T;
    await this.db.withTransactionAsync(async () => {
      result = await fn(this);
    });
    return result!;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// Export singleton instance
export const db = new SQLiteWrapper();
export default db;