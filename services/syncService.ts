// client/services/syncService.ts
import NetInfo from '@react-native-community/netinfo';
import { TasksAPI } from '../api/tasks';
import { LocalTaskRow } from '../types';
import { localTaskService } from './localTaskService';

export interface SyncResult {
  success: boolean;
  syncedTasks: number;
  errors: string[];
}

export interface SyncStats {
  pendingCreates: number;
  pendingUpdates: number;
  pendingDeletes: number;
  lastSyncTime: number | null;
}

export class SyncService {
  private tasksApi: TasksAPI;
  private isOnline: boolean = false;
  private isSyncing: boolean = false;

  constructor() {
    this.tasksApi = new TasksAPI();
    this.setupNetworkListener();
  }

  /**
   * Setup network connectivity listener
   */
  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = !!(state.isConnected && state.isInternetReachable);
      
      // Auto-sync when coming back online
      if (wasOffline && this.isOnline) {
        this.syncAllTasks().catch(console.error);
      }
    });
  }

  /**
   * Check if device is online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<SyncStats> {
    const dirtyTasks = await localTaskService.getDirtyTasks();
    
    const pendingCreates = dirtyTasks.filter(t => t.op === 'create').length;
    const pendingUpdates = dirtyTasks.filter(t => t.op === 'update').length;
    const pendingDeletes = dirtyTasks.filter(t => t.op === 'delete').length;

    return {
      pendingCreates,
      pendingUpdates,
      pendingDeletes,
      lastSyncTime: null, // TODO: Store in AsyncStorage
    };
  }

  /**
   * Sync all dirty tasks with server
   */
  async syncAllTasks(): Promise<SyncResult> {
    if (!this.isOnline || this.isSyncing) {
      return {
        success: false,
        syncedTasks: 0,
        errors: ['Device is offline or sync already in progress'],
      };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      syncedTasks: 0,
      errors: [],
    };

    try {
      const dirtyTasks = await localTaskService.getDirtyTasks();
      
      // Group tasks by operation type for ordered processing
      const creates = dirtyTasks.filter(t => t.op === 'create');
      const updates = dirtyTasks.filter(t => t.op === 'update');
      const deletes = dirtyTasks.filter(t => t.op === 'delete');

      // Process in order: creates, updates, deletes
      await this.processCreates(creates, result);
      await this.processUpdates(updates, result);
      await this.processDeletes(deletes, result);

    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Process create operations
   */
  private async processCreates(tasks: LocalTaskRow[], result: SyncResult): Promise<void> {
    for (const task of tasks) {
      try {
        const createData = {
          title: task.title,
          description: task.description,
          completed: task.completed === 1,
          action_category: task.action_category,
          priority: task.priority,
        };

        const response = await this.tasksApi.createTask(createData);
        
        if (response.error) {
          result.errors.push(`Failed to create task "${task.title}": ${response.error}`);
          continue;
        }

        // Update local task with server ID and mark as synced
        if (response.data) {
          await this.updateLocalTaskAfterSync(task.id, response.data);
          result.syncedTasks++;
        }

      } catch (error) {
        result.errors.push(`Error creating task "${task.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Process update operations
   */
  private async processUpdates(tasks: LocalTaskRow[], result: SyncResult): Promise<void> {
    for (const task of tasks) {
      try {
        const updateData = {
          title: task.title,
          description: task.description,
          completed: task.completed === 1,
          action_category: task.action_category,
          priority: task.priority,
        };

        const response = await this.tasksApi.updateTask(parseInt(task.id), updateData);
        
        if (response.error) {
          result.errors.push(`Failed to update task "${task.title}": ${response.error}`);
          continue;
        }

        // Mark as synced
        await localTaskService.markTaskSynced(task.id);
        result.syncedTasks++;

      } catch (error) {
        result.errors.push(`Error updating task "${task.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Process delete operations
   */
  private async processDeletes(tasks: LocalTaskRow[], result: SyncResult): Promise<void> {
    for (const task of tasks) {
      try {
        const response = await this.tasksApi.deleteTask(parseInt(task.id));
        
        if (response.error) {
          result.errors.push(`Failed to delete task "${task.title}": ${response.error}`);
          continue;
        }

        // Mark as synced
        await localTaskService.markTaskSynced(task.id);
        result.syncedTasks++;

      } catch (error) {
        result.errors.push(`Error deleting task "${task.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Update local task after successful server sync
   */
  private async updateLocalTaskAfterSync(localId: string, serverTask: any): Promise<void> {
    // For creates, we need to update the local ID with server ID
    // and clear the dirty flag
    await localTaskService.upsertTaskFromServer({
      ...serverTask,
      id: localId, // Keep local ID for now
    });
    
    await localTaskService.markTaskSynced(localId);
  }

  /**
   * Pull latest tasks from server
   */
  async pullLatestTasks(): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        syncedTasks: 0,
        errors: ['Device is offline'],
      };
    }

    const result: SyncResult = {
      success: true,
      syncedTasks: 0,
      errors: [],
    };

    try {
      const response = await this.tasksApi.getAllTasks();
      
      if (response.error) {
        result.success = false;
        result.errors.push(`Failed to fetch tasks: ${response.error}`);
        return result;
      }

      // Update local database with server data
      if (response.data) {
        for (const serverTask of response.data) {
          await localTaskService.upsertTaskFromServer(serverTask);
          result.syncedTasks++;
        }
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Error pulling tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }
}

// Export singleton instance
export const syncService = new SyncService();
