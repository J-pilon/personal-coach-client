import { db } from '../db/sqlite'
import { nowMs } from '@/utils/time'
import { LocalTaskRow, TaskOperation } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export interface CreateTaskData {
  title: string;
  description?: string;
  action_category:  'do' | 'defer' | 'delegate';
  priority?: number;
  smart_goal_id?: number | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  action_category?:  'do' | 'defer' | 'delegate';
  priority?: number | null;
  smart_goal_id?: string | null;
}

export class LocalTaskService {
  async createTask(taskData: CreateTaskData): Promise<LocalTaskRow> {
    const now = nowMs()
    const task: LocalTaskRow = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description,
      completed: 0,
      action_category: taskData.action_category,
      priority: taskData.priority || null,
      smart_goal_id: taskData.smart_goal_id || null,
      updated_at_ms: now,
      deleted: 0,
      dirty: 1, // Mark as unsynced
      op: 'create',
    }

    await db.runAsync(
      `INSERT INTO tasks (
        id, title, description, completed, action_category, 
        priority, smart_goal_id, updated_at_ms, deleted, dirty, op
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.description,
        task.completed,
        task.action_category,
        task.priority,
        task.smart_goal_id,
        task.updated_at_ms,
        task.deleted,
        task.dirty,
        task.op,
      ]
    );

    return task;
  }

  async updateTask(id: string, updates: UpdateTaskData): Promise<LocalTaskRow | null> {
    const now = nowMs();
    
    // Get current task
    const currentTask = await this.getTask(id);
    if (!currentTask) {
      return null;
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }
    if (updates.completed !== undefined) {
      updateFields.push('completed = ?');
      updateValues.push(updates.completed ? 1 : 0);
    }
    if (updates.action_category !== undefined) {
      updateFields.push('action_category = ?');
      updateValues.push(updates.action_category);
    }
    if (updates.priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(updates.priority);
    }
    if (updates.smart_goal_id !== undefined) {
      updateFields.push('smart_goal_id = ?');
      updateValues.push(updates.smart_goal_id);
    }

    // Always update timestamp and sync flags
    updateFields.push('updated_at_ms = ?');
    updateFields.push('dirty = ?');
    updateFields.push('op = ?');
    updateValues.push(now, 1, 'update');

    updateValues.push(id);

    await db.runAsync(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return await this.getTask(id);
  }

  /**
   * Soft delete a task locally
   */
  async deleteTask(id: string): Promise<boolean> {
    const now = nowMs();
    
    const result = await db.runAsync(
      `UPDATE tasks SET 
        deleted = 1, 
        dirty = 1, 
        op = ?, 
        updated_at_ms = ? 
      WHERE id = ? AND deleted = 0`,
      ['delete', now, id]
    );

    return result.changes > 0;
  }

  /**
   * Get a single task by ID
   */
  async getTask(id: string): Promise<LocalTaskRow | null> {
    return await db.getAsync<LocalTaskRow>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
  }

  /**
   * Get all active (non-deleted) tasks
   */
  async getAllTasks(): Promise<LocalTaskRow[]> {
    return await db.getAllAsync<LocalTaskRow>(
      'SELECT * FROM tasks WHERE deleted = 0 ORDER BY updated_at_ms DESC'
    );
  }

  /**
   * Get tasks by completion status
   */
  async getTasksByCompletion(completed: boolean): Promise<LocalTaskRow[]> {
    return await db.getAllAsync<LocalTaskRow>(
      'SELECT * FROM tasks WHERE deleted = 0 AND completed = ? ORDER BY updated_at_ms DESC',
      [completed ? 1 : 0]
    );
  }

  /**
   * Get tasks by action category
   */
  async getTasksByCategory(action_category: number): Promise<LocalTaskRow[]> {
    return await db.getAllAsync<LocalTaskRow>(
      'SELECT * FROM tasks WHERE deleted = 0 AND action_category = ? ORDER BY updated_at_ms DESC',
      [action_category]
    );
  }

  /**
   * Get all dirty (unsynced) tasks for sync operations
   */
  async getDirtyTasks(): Promise<LocalTaskRow[]> {
    return await db.getAllAsync<LocalTaskRow>(
      'SELECT * FROM tasks WHERE dirty = 1 ORDER BY updated_at_ms ASC'
    );
  }

  /**
   * Mark a task as synced (clear dirty flag)
   */
  async markTaskSynced(id: string): Promise<void> {
    await db.runAsync(
      'UPDATE tasks SET dirty = 0, op = NULL WHERE id = ?',
      [id]
    );
  }

  /**
   * Insert or update a task from server (during sync)
   */
  async upsertTaskFromServer(serverTask: any): Promise<LocalTaskRow | null> {
    const now = nowMs();
    
    // Check if task exists
    const existing = await this.getTask(serverTask.id);
    
    if (existing) {
      // Update existing task
      await db.runAsync(
        `UPDATE tasks SET 
          title = ?, description = ?, completed = ?, action_category = ?,
          priority = ?, smart_goal_id = ?, updated_at_ms = ?, 
          dirty = 0, op = NULL
        WHERE id = ?`,
        [
          serverTask.title,
          serverTask.description,
          serverTask.completed ? 1 : 0,
          serverTask.action_category,
          serverTask.priority,
          serverTask.smart_goal_id,
          now,
          serverTask.id,
        ]
      );
    } else {
      // Insert new task
      await db.runAsync(
        `INSERT INTO tasks (
          id, title, description, completed, action_category,
          priority, smart_goal_id, updated_at_ms, deleted, dirty, op
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          serverTask.id,
          serverTask.title,
          serverTask.description,
          serverTask.completed ? 1 : 0,
          serverTask.action_category,
          serverTask.priority,
          serverTask.smart_goal_id,
          now,
          0, // not deleted
          0, // not dirty (came from server)
          null, // no operation
        ]
      );
    }

    return await this.getTask(serverTask.id)!;
  }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    dirty: number;
  }> {
    const [totalResult, completedResult, dirtyResult] = await Promise.all([
      db.getAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks WHERE deleted = 0'),
      db.getAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks WHERE deleted = 0 AND completed = 1'),
      db.getAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks WHERE dirty = 1'),
    ]);

    return {
      total: totalResult?.count || 0,
      completed: completedResult?.count || 0,
      pending: (totalResult?.count || 0) - (completedResult?.count || 0),
      dirty: dirtyResult?.count || 0,
    };
  }
}
  
  // Export singleton instance
  export const localTaskService = new LocalTaskService();