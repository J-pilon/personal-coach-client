import * as SQLite from 'expo-sqlite';
import { db } from '../../db/sqlite';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('SQLiteWrapper', () => {
  let mockDatabase: jest.Mocked<SQLite.SQLiteDatabase>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock database
    mockDatabase = {
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
      withTransactionAsync: jest.fn(),
      closeAsync: jest.fn(),
    } as any;

    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDatabase);
  });

  describe('Database Initialization', () => {
    it('should initialize database with default name', async () => {
      await db.init();

      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('personal-coach.db');
    });

    it('should initialize database with custom name', async () => {
      await db.init('custom.db');

      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('custom.db');
    });

    it('should throw error when operations called before init', async () => {
      // Reset the database to null state
      await db.close();
      
      await expect(db.runAsync('SELECT 1')).rejects.toThrow('Database not initialized');
      await expect(db.getAsync('SELECT 1')).rejects.toThrow('Database not initialized');
      await expect(db.getAllAsync('SELECT 1')).rejects.toThrow('Database not initialized');
      await expect(db.transaction(() => Promise.resolve())).rejects.toThrow('Database not initialized');
    });
  });

  describe('runAsync', () => {
    beforeEach(async () => {
      await db.init();
    });

    it('should execute SQL with parameters', async () => {
      const mockResult = { changes: 1, lastInsertRowId: 123 };
      mockDatabase.runAsync.mockResolvedValue(mockResult);

      const result = await db.runAsync('INSERT INTO tasks (title) VALUES (?)', ['Test Task']);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith('INSERT INTO tasks (title) VALUES (?)', ['Test Task']);
      expect(result).toEqual(mockResult);
    });

    it('should execute SQL without parameters', async () => {
      const mockResult = { changes: 0, lastInsertRowId: 0 };
      mockDatabase.runAsync.mockResolvedValue(mockResult);

      const result = await db.runAsync('CREATE TABLE test (id INTEGER)');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith('CREATE TABLE test (id INTEGER)', []);
      expect(result).toEqual(mockResult);
    });

    it('should handle database errors', async () => {
      const error = new Error('SQLite error');
      mockDatabase.runAsync.mockRejectedValue(error);

      await expect(db.runAsync('INVALID SQL')).rejects.toThrow('SQLite error');
    });
  });

  describe('getAsync', () => {
    beforeEach(async () => {
      await db.init();
    });

    it('should return single row', async () => {
      const mockRow = { id: 1, title: 'Test Task' };
      mockDatabase.getFirstAsync.mockResolvedValue(mockRow);

      const result = await db.getAsync('SELECT * FROM tasks WHERE id = ?', [1]);

      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = ?', [1]);
      expect(result).toEqual(mockRow);
    });

    it('should return null when no rows found', async () => {
      mockDatabase.getFirstAsync.mockResolvedValue(undefined);

      const result = await db.getAsync('SELECT * FROM tasks WHERE id = ?', [999]);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('SQLite error');
      mockDatabase.getFirstAsync.mockRejectedValue(error);

      await expect(db.getAsync('INVALID SQL')).rejects.toThrow('SQLite error');
    });
  });

  describe('getAllAsync', () => {
    beforeEach(async () => {
      await db.init();
    });

    it('should return array of rows', async () => {
      const mockRows = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' }
      ];
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      const result = await db.getAllAsync('SELECT * FROM tasks');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith('SELECT * FROM tasks', []);
      expect(result).toEqual(mockRows);
    });

    it('should return empty array when no rows found', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const result = await db.getAllAsync('SELECT * FROM tasks WHERE id = ?', [999]);

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('SQLite error');
      mockDatabase.getAllAsync.mockRejectedValue(error);

      await expect(db.getAllAsync('INVALID SQL')).rejects.toThrow('SQLite error');
    });
  });

  describe('transaction', () => {
    beforeEach(async () => {
      await db.init();
    });

    it('should execute transaction function', async () => {
      const mockResult = 'transaction result';
      mockDatabase.withTransactionAsync.mockImplementation(async (fn) => {
        await fn();
      });

      const result = await db.transaction(async (tx) => {
        await tx.runAsync('INSERT INTO tasks (title) VALUES (?)', ['Test']);
        return mockResult;
      });

      expect(mockDatabase.withTransactionAsync).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it('should handle transaction errors', async () => {
      const error = new Error('Transaction error');
      mockDatabase.withTransactionAsync.mockRejectedValue(error);

      await expect(db.transaction(async () => {
        throw error;
      })).rejects.toThrow('Transaction error');
    });

    it('should pass SQLiteWrapper instance to transaction function', async () => {
      let receivedTx: any;
      mockDatabase.withTransactionAsync.mockImplementation(async (fn) => {
        await fn();
      });

      await db.transaction(async (tx) => {
        receivedTx = tx;
        expect(tx).toBe(db);
      });

      expect(receivedTx).toBe(db);
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      await db.init();
    });

    it('should close database connection', async () => {
      await db.close();

      expect(mockDatabase.closeAsync).toHaveBeenCalled();
    });

    it('should handle close when database not initialized', async () => {
      // Reset the database to null state
      await db.close();
      
      // Should not throw error
      await expect(db.close()).resolves.toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle init errors', async () => {
      const error = new Error('Failed to open database');
      (SQLite.openDatabaseAsync as jest.Mock).mockRejectedValue(error);

      await expect(db.init()).rejects.toThrow('Failed to open database');
    });

    it('should maintain error state after failed init', async () => {
      const error = new Error('Failed to open database');
      (SQLite.openDatabaseAsync as jest.Mock).mockRejectedValue(error);

      await expect(db.init()).rejects.toThrow('Failed to open database');
      
      // Should still throw error for operations
      await expect(db.runAsync('SELECT 1')).rejects.toThrow('Database not initialized');
    });
  });
});
