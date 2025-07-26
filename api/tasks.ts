// API client for Rails server tasks endpoints
// Base URL for the Rails server API
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Task interface matching the Rails model
export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  action_category: 'do' | 'defer' | 'delegate';
  priority?: number;
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
  priority?: number;
  action_category: 'do' | 'defer' | 'delegate';
}

// Update task parameters (all fields optional except id)
export interface UpdateTaskParams {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: number;
  action_category?: 'do' | 'defer' | 'delegate';
}

// API response wrapper
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Check if response has content and is JSON
    const contentType = response.headers.get('content-type');
    const hasContent = contentType && contentType.includes('application/json');
    
    let data: any = undefined;
    
    if (hasContent) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.log("**** JSON PARSE ERROR: ", parseError);
        return {
          error: 'Invalid JSON response from server',
          status: response.status,
        };
      }
    } else {
      console.log("**** RESPONSE: No content (status:", response.status, ")");
    }

    if (!response.ok) {
      return {
        error: data?.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

// Tasks API functions
export const tasksApi = {
  // Get all tasks
  async getAllTasks(): Promise<ApiResponse<Task[]>> {
    return apiRequest<Task[]>('/tasks');
  },

  // Get a single task by ID
  async getTask(id: number): Promise<ApiResponse<Task>> {
    return apiRequest<Task>(`/tasks/${id}`);
  },

  // Create a new task
  async createTask(taskData: CreateTaskParams): Promise<ApiResponse<Task>> {
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ task: taskData }),
    });
  },

  // Update an existing task
  async updateTask(id: number, taskData: UpdateTaskParams): Promise<ApiResponse<Task>> {
    return apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ task: taskData }),
    });
  },

  // Delete a task
  async deleteTask(id: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle task completion status
  async toggleTaskCompletion(id: number, completed: boolean): Promise<ApiResponse<Task>> {
    return this.updateTask(id, { completed });
  },

  // Get tasks by action category
  async getTasksByCategory(category: 'do' | 'defer' | 'delegate'): Promise<ApiResponse<Task[]>> {
    const response = await this.getAllTasks();
    if (response.data) {
      const filteredTasks = response.data.filter(task => task.action_category === category);
      return {
        data: filteredTasks,
        status: response.status,
      };
    }
    return response;
  },

  // Get completed tasks
  async getCompletedTasks(): Promise<ApiResponse<Task[]>> {
    const response = await this.getAllTasks();
    if (response.data) {
      const completedTasks = response.data.filter(task => task.completed);
      return {
        data: completedTasks,
        status: response.status,
      };
    }
    return response;
  },

  // Get incomplete tasks
  async getIncompleteTasks(): Promise<ApiResponse<Task[]>> {
    const response = await this.getAllTasks();
    if (response.data) {
      const incompleteTasks = response.data.filter(task => !task.completed);
      return {
        data: incompleteTasks,
        status: response.status,
      };
    }
    return response;
  },
};

// Utility functions for common task operations
export const taskUtils = {
  // Create a new task with default values
  createDefaultTask(title: string, actionCategory: 'do' | 'defer' | 'delegate' = 'do'): CreateTaskParams {
    return {
      title,
      description: '',
      completed: false,
      action_category: actionCategory,
    };
  },

  // Format task for display
  formatTask(task: Task): string {
    const status = task.completed ? '✓' : '○';
    const category = task.action_category.toUpperCase();
    return `${status} [${category}] ${task.title}`;
  },

  // Check if task is overdue (placeholder for future implementation)
  isOverdue(task: Task): boolean {
    // This could be enhanced with due dates when they're added to the model
    return false;
  },
};

// Export default API instance
export default tasksApi; 