// API client for Rails server tasks endpoints
import { apiDelete, apiGet, apiPost, apiPut, type ApiResponse } from '../utils/apiRequest';

// Task interface matching the Rails model
export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  action_category: 'do' | 'defer' | 'delegate';
  priority?: number | null;
  profile_id: number;
  created_at?: string;
  updated_at?: string;
  isAiSuggestion?: boolean;
}

// Create task parameters (without id and timestamps)
export interface CreateTaskParams {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: number | null;
  action_category: 'do' | 'defer' | 'delegate';
}

// Update task parameters (all fields optional except id)
export interface UpdateTaskParams {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: number | null;
  action_category?: 'do' | 'defer' | 'delegate';
}

// Tasks API class
export class TasksAPI {
  async getAllTasks(): Promise<ApiResponse<Task[]>> {
    return apiGet<Task[]>('/tasks');
  }

  async getTask(id: number): Promise<ApiResponse<Task>> {
    return apiGet<Task>(`/tasks/${id}`);
  }

  async createTask(taskData: CreateTaskParams): Promise<ApiResponse<Task>> {
    return apiPost<Task>('/tasks', { task: taskData });
  }

  async updateTask(id: number, taskData: UpdateTaskParams): Promise<ApiResponse<Task>> {
    return apiPut<Task>(`/tasks/${id}`, { task: taskData });
  }

  async deleteTask(id: number): Promise<ApiResponse<void>> {
    return apiDelete<void>(`/tasks/${id}`);
  }

  async toggleTaskCompletion(id: number, completed: boolean): Promise<ApiResponse<Task>> {
    return apiPut<Task>(`/tasks/${id}`, { task: { completed } });
  }

  async getTasksByCategory(category: 'do' | 'defer' | 'delegate'): Promise<ApiResponse<Task[]>> {
    return apiGet<Task[]>('/tasks', { action_category: category });
  }

  async getCompletedTasks(): Promise<ApiResponse<Task[]>> {
    return apiGet<Task[]>('/tasks', { completed: true });
  }

  async getIncompleteTasks(): Promise<ApiResponse<Task[]>> {
    return apiGet<Task[]>('/tasks', { completed: false });
  }

  // Helper methods
  createDefaultTask(title: string, actionCategory: 'do' | 'defer' | 'delegate' = 'do'): CreateTaskParams {
    return {
      title,
      action_category: actionCategory,
      completed: false,
    };
  }

  formatTask(task: Task): string {
    return `${task.title}${task.description ? ` - ${task.description}` : ''}`;
  }

  isOverdue(task: Task): boolean {
    if (!task.created_at) return false;
    const createdDate = new Date(task.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 7; // Consider overdue after 7 days
  }
} 