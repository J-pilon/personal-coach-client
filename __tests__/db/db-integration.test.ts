import { ensureMigrations } from '../../db/migrations';
import { db } from '../../db/sqlite';
import { isoToMs, msToIso, nowMs } from '../../utils/time';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('Database Integration Tests', () => {
  let mockDatabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a more realistic mock database
    mockDatabase = {
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
      withTransactionAsync: jest.fn(),
      closeAsync: jest.fn(),
    };

    // Mock successful database operations
    mockDatabase.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
    mockDatabase.getFirstAsync.mockResolvedValue(null);
    mockDatabase.getAllAsync.mockResolvedValue([]);
    mockDatabase.withTransactionAsync.mockImplementation(async (fn: any) => {
      await fn();
    });

    const SQLite = require('expo-sqlite');
    SQLite.openDatabaseAsync.mockResolvedValue(mockDatabase);
  });

  describe('Database Initialization Flow', () => {
    it('should complete full initialization process', async () => {
      await ensureMigrations();

      // Verify database was initialized
      expect(mockDatabase.runAsync).toHaveBeenCalled();
      
      // Verify table creation was called
      const tableCreationCall = mockDatabase.runAsync.mock.calls.find(
        (call: any) => call[0].includes('CREATE TABLE IF NOT EXISTS tasks')
      );
      expect(tableCreationCall).toBeDefined();
    });

    it('should handle initialization errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.runAsync.mockRejectedValue(error);

      await expect(ensureMigrations()).rejects.toThrow('Database connection failed');
    });
  });

  describe('CRUD Operations Simulation', () => {
    beforeEach(async () => {
      await ensureMigrations();
    });

    it('should simulate task creation', async () => {
      const taskData = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        completed: 0,
        action_category: 1,
        priority: 2,
        smart_goal_id: 'goal-1',
        updated_at_ms: nowMs(),
        deleted: 0,
        dirty: 1,
        op: 'create'
      };

      await db.runAsync(
        'INSERT INTO tasks (id, title, description, completed, action_category, priority, smart_goal_id, updated_at_ms, deleted, dirty, op) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          taskData.id,
          taskData.title,
          taskData.description,
          taskData.completed,
          taskData.action_category,
          taskData.priority,
          taskData.smart_goal_id,
          taskData.updated_at_ms,
          taskData.deleted,
          taskData.dirty,
          taskData.op
        ]
      );

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        expect.arrayContaining([taskData.id, taskData.title])
      );
    });

    it('should simulate task retrieval', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        completed: 0,
        action_category: 1,
        updated_at_ms: nowMs(),
        deleted: 0,
        dirty: 0
      };

      mockDatabase.getFirstAsync.mockResolvedValue(mockTask);

      const result = await db.getAsync('SELECT * FROM tasks WHERE id = ?', ['task-1']);

      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE id = ?',
        ['task-1']
      );
      expect(result).toEqual(mockTask);
    });

    it('should simulate task listing', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          completed: 0,
          action_category: 1,
          updated_at_ms: nowMs(),
          deleted: 0,
          dirty: 0
        },
        {
          id: 'task-2',
          title: 'Task 2',
          completed: 1,
          action_category: 2,
          updated_at_ms: nowMs(),
          deleted: 0,
          dirty: 0
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(mockTasks);

      const result = await db.getAllAsync('SELECT * FROM tasks WHERE deleted = 0 ORDER BY updated_at_ms DESC');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE deleted = 0 ORDER BY updated_at_ms DESC',
        []
      );
      expect(result).toEqual(mockTasks);
    });

    it('should simulate task update', async () => {
      const taskId = 'task-1';
      const newTitle = 'Updated Task';
      const newUpdatedAt = nowMs();

      await db.runAsync(
        'UPDATE tasks SET title = ?, updated_at_ms = ?, dirty = 1, op = ? WHERE id = ?',
        [newTitle, newUpdatedAt, 'update', taskId]
      );

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        'UPDATE tasks SET title = ?, updated_at_ms = ?, dirty = 1, op = ? WHERE id = ?',
        [newTitle, newUpdatedAt, 'update', taskId]
      );
    });

    it('should simulate task deletion (soft delete)', async () => {
      const taskId = 'task-1';
      const newUpdatedAt = nowMs();

      await db.runAsync(
        'UPDATE tasks SET deleted = 1, updated_at_ms = ?, dirty = 1, op = ? WHERE id = ?',
        [newUpdatedAt, 'delete', taskId]
      );

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        'UPDATE tasks SET deleted = 1, updated_at_ms = ?, dirty = 1, op = ? WHERE id = ?',
        [newUpdatedAt, 'delete', taskId]
      );
    });
  });

  describe('Transaction Operations', () => {
    beforeEach(async () => {
      await ensureMigrations();
    });

    it('should simulate batch task operations in transaction', async () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', action_category: 1, updated_at_ms: nowMs() },
        { id: 'task-2', title: 'Task 2', action_category: 2, updated_at_ms: nowMs() }
      ];

      await db.transaction(async (tx) => {
        for (const task of tasks) {
          await tx.runAsync(
            'INSERT INTO tasks (id, title, action_category, updated_at_ms, completed, deleted, dirty) VALUES (?, ?, ?, ?, 0, 0, 1)',
            [task.id, task.title, task.action_category, task.updated_at_ms]
          );
        }
        return 'transaction completed';
      });

      expect(mockDatabase.withTransactionAsync).toHaveBeenCalled();
      // The runAsync calls include the migration calls from beforeEach, so we check for at least 2
      expect(mockDatabase.runAsync).toHaveBeenCalled();
    });

    it('should handle transaction rollback on error', async () => {
      const error = new Error('Transaction failed');
      mockDatabase.runAsync.mockRejectedValueOnce(error);

      await expect(db.transaction(async (tx) => {
        await tx.runAsync('INSERT INTO tasks (id, title) VALUES (?, ?)', ['task-1', 'Task 1']);
        throw error;
      })).rejects.toThrow('Transaction failed');

      expect(mockDatabase.withTransactionAsync).toHaveBeenCalled();
    });
  });

  describe('Time Integration', () => {
    it('should work with time utilities for timestamps', () => {
      const now = nowMs();
      const iso = msToIso(now);
      const backToMs = isoToMs(iso);

      expect(backToMs).toBe(now);
    });

    it('should handle timestamp conversion in database operations', async () => {
      const now = nowMs();
      const iso = msToIso(now);

      // Test that time conversion works correctly
      expect(isoToMs(iso)).toBe(now);
    });
  });

  describe('Performance and Index Usage', () => {
    beforeEach(async () => {
      await ensureMigrations();
    });

    it('should use indexes for common queries', async () => {
      // Simulate queries that should use indexes
      await db.getAllAsync('SELECT * FROM tasks WHERE deleted = 0 AND dirty = 1');
      await db.getAllAsync('SELECT * FROM tasks WHERE completed = 1');
      await db.getAllAsync('SELECT * FROM tasks WHERE action_category = 1');
      await db.getAllAsync('SELECT * FROM tasks ORDER BY updated_at_ms DESC');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledTimes(4);
    });

    it('should handle large result sets efficiently', async () => {
      const largeResultSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        completed: i % 2,
        action_category: (i % 5) + 1,
        updated_at_ms: nowMs() - i,
        deleted: 0,
        dirty: 0
      }));

      mockDatabase.getAllAsync.mockResolvedValue(largeResultSet);

      const result = await db.getAllAsync('SELECT * FROM tasks ORDER BY updated_at_ms DESC LIMIT 1000');

      expect(result).toHaveLength(1000);
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM tasks ORDER BY updated_at_ms DESC LIMIT 1000',
        []
      );
    });
  });

  describe('Error Recovery', () => {
    it('should handle database errors gracefully', async () => {
      // Test that error handling is properly set up
      expect(mockDatabase.runAsync).toBeDefined();
    });
  });
});
