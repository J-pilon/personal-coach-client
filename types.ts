export interface ServerTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  action_category: number;
  priority?: number | null;
  smart_goal_id?: string | number | null;
  updated_at: string; // ISO8601
}

export interface LocalTaskRow {
  id: string;
  title: string;
  description?: string;
  completed: number; // 0 or 1
  action_category: number;
  priority?: number | null;
  smart_goal_id?: string | null;
  updated_at_ms: number; // local ms epoch
  deleted: number; // 0 or 1 (tombstone)
  dirty: number; // 0 or 1 (unsynced)
  op?: string | null; // 'create' | 'update' | 'delete' | null
}

export type TaskOperation = 'create' | 'update' | 'delete';