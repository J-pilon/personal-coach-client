export interface ServerTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  action_category:  'do' | 'defer' | 'delegate';
  priority?: number | null;
  smart_goal_id?: string | number | null;
  updated_at: string; // ISO8601
}

export interface LocalTaskRow {
  id: string;
  title: string;
  description?: string;
  completed: number; // 0 or 1
  action_category:  'do' | 'defer' | 'delegate';
  priority?: number | null;
  smart_goal_id?: string | null;
  updated_at_ms: number; // local ms epoch
  deleted: number; // 0 or 1 (tombstone)
  dirty: number; // 0 or 1 (unsynced)
  op?: string | null; // 'create' | 'update' | 'delete' | null
}

export type TaskOperation = 'create' | 'update' | 'delete';




// TODO: WHERE I LEFT OFF:
  // 1. I need to add tests for the localTaskService.ts and syncService.ts file
  // 2. Tell the AI to move to the next implementation step
    // Next Step:
    // After you create this file, we'll create the Offline-First Hooks that replace the existing useTasks.ts with offline-capable versions.
    // Ready to create this file and move to the next step?