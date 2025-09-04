import { ensureMigrations, getDbVersion, setDbVersion } from '../../db/migrations';
import { db } from '../../db/sqlite';

// Mock the sqlite module
jest.mock('../../db/sqlite', () => ({
  db: {
    init: jest.fn(),
    runAsync: jest.fn(),
    getAsync: jest.fn(),
  },
}));

describe('Database Migrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureMigrations', () => {
    it('should initialize database and create tasks table', async () => {
      await ensureMigrations();

      expect(db.init).toHaveBeenCalled();
      expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS tasks'));
    });

    it('should create tasks table with correct schema', async () => {
      await ensureMigrations();

      const createTableCall = (db.runAsync as jest.Mock).mock.calls.find(
        call => call[0].includes('CREATE TABLE IF NOT EXISTS tasks')
      );

      expect(createTableCall).toBeDefined();
      const sql = createTableCall[0];
      
      // Check for required columns
      expect(sql).toContain('id TEXT PRIMARY KEY');
      expect(sql).toContain('title TEXT NOT NULL');
      expect(sql).toContain('description TEXT');
      expect(sql).toContain('completed INTEGER NOT NULL DEFAULT 0');
      expect(sql).toContain('action_category INTEGER NOT NULL');
      expect(sql).toContain('priority INTEGER');
      expect(sql).toContain('smart_goal_id TEXT');
      expect(sql).toContain('updated_at_ms INTEGER NOT NULL');
      expect(sql).toContain('deleted INTEGER NOT NULL DEFAULT 0');
      expect(sql).toContain('dirty INTEGER NOT NULL DEFAULT 0');
      expect(sql).toContain('op TEXT');
    });

    it('should create all required indexes', async () => {
      await ensureMigrations();

      const indexCalls = (db.runAsync as jest.Mock).mock.calls.filter(
        call => call[0].includes('CREATE INDEX IF NOT EXISTS')
      );

      expect(indexCalls).toHaveLength(4);

      const indexNames = indexCalls.map(call => call[0]);
      
      expect(indexNames.some(sql => sql.includes('idx_tasks_updated'))).toBe(true);
      expect(indexNames.some(sql => sql.includes('idx_tasks_flags'))).toBe(true);
      expect(indexNames.some(sql => sql.includes('idx_tasks_completed'))).toBe(true);
      expect(indexNames.some(sql => sql.includes('idx_tasks_action_category'))).toBe(true);
    });

    it('should create updated_at_ms index with DESC ordering', async () => {
      await ensureMigrations();

      const updatedIndexCall = (db.runAsync as jest.Mock).mock.calls.find(
        call => call[0].includes('idx_tasks_updated')
      );

      expect(updatedIndexCall).toBeDefined();
      expect(updatedIndexCall[0]).toContain('ON tasks(updated_at_ms DESC)');
    });

    it('should create flags index on deleted and dirty columns', async () => {
      await ensureMigrations();

      const flagsIndexCall = (db.runAsync as jest.Mock).mock.calls.find(
        call => call[0].includes('idx_tasks_flags')
      );

      expect(flagsIndexCall).toBeDefined();
      expect(flagsIndexCall[0]).toContain('ON tasks(deleted, dirty)');
    });

    it('should handle database initialization errors', async () => {
      const error = new Error('Database init failed');
      (db.init as jest.Mock).mockRejectedValue(error);

      await expect(ensureMigrations()).rejects.toThrow('Database init failed');
    });

    it('should handle table creation errors', async () => {
      (db.init as jest.Mock).mockResolvedValue(undefined);
      const error = new Error('Table creation failed');
      (db.runAsync as jest.Mock).mockRejectedValueOnce(error);

      await expect(ensureMigrations()).rejects.toThrow('Table creation failed');
    });
  });

  describe('getDbVersion', () => {
    it('should return 0 when no version table exists', async () => {
      (db.getAsync as jest.Mock).mockResolvedValue(null);

      const version = await getDbVersion();

      expect(version).toBe(0);
      expect(db.getAsync).toHaveBeenCalledWith(
        'SELECT version FROM sqlite_master WHERE type="table" AND name="db_version"'
      );
    });

    it('should return version from database', async () => {
      (db.getAsync as jest.Mock).mockResolvedValue({ version: 5 });

      const version = await getDbVersion();

      expect(version).toBe(5);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (db.getAsync as jest.Mock).mockRejectedValue(error);

      await expect(getDbVersion()).rejects.toThrow('Database error');
    });
  });

  describe('setDbVersion', () => {
    it('should create version table and insert version', async () => {
      await setDbVersion(3);

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS db_version (version INTEGER)')
      );
      expect(db.runAsync).toHaveBeenCalledWith('DELETE FROM db_version');
      expect(db.runAsync).toHaveBeenCalledWith(
        'INSERT INTO db_version (version) VALUES (?)',
        [3]
      );
    });

    it('should handle version 0', async () => {
      await setDbVersion(0);

      expect(db.runAsync).toHaveBeenCalledWith(
        'INSERT INTO db_version (version) VALUES (?)',
        [0]
      );
    });

    it('should handle negative versions', async () => {
      await setDbVersion(-1);

      expect(db.runAsync).toHaveBeenCalledWith(
        'INSERT INTO db_version (version) VALUES (?)',
        [-1]
      );
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (db.runAsync as jest.Mock).mockRejectedValue(error);

      await expect(setDbVersion(1)).rejects.toThrow('Database error');
    });
  });

  describe('Migration Integration', () => {
    it('should complete full migration process', async () => {
      // Mock successful database operations
      (db.init as jest.Mock).mockResolvedValue(undefined);
      (db.runAsync as jest.Mock).mockResolvedValue({ changes: 1 });

      await ensureMigrations();

      // Verify all operations were called
      expect(db.init).toHaveBeenCalled();
      expect(db.runAsync).toHaveBeenCalledTimes(5); // 1 table + 4 indexes
    });

    it('should be idempotent - can be called multiple times', async () => {
      (db.init as jest.Mock).mockResolvedValue(undefined);
      (db.runAsync as jest.Mock).mockResolvedValue({ changes: 1 });

      await ensureMigrations();
      await ensureMigrations();

      // Should not throw errors on second call
      expect(db.init).toHaveBeenCalledTimes(2);
      expect(db.runAsync).toHaveBeenCalledTimes(10); // 2 * (1 table + 4 indexes)
    });
  });
});
