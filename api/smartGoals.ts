// API client for Rails server smart goals endpoints
import { apiDelete, apiGet, apiPatch, apiPost, type ApiResponse } from '../utils/apiRequest';

export interface SmartGoal {
  id?: number;
  profile_id: number;
  title: string;
  description?: string;
  timeframe: '1_month' | '3_months' | '6_months';
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
  completed: boolean;
  target_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSmartGoalParams {
  title: string;
  description?: string;
  timeframe: '1_month' | '3_months' | '6_months';
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
  completed?: boolean;
  target_date?: string;
}

export interface UpdateSmartGoalParams {
  title?: string;
  description?: string;
  timeframe?: '1_month' | '3_months' | '6_months';
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  time_bound?: string;
  completed?: boolean;
  target_date?: string;
}

// Smart Goals API class
export class SmartGoalsAPI {
  async getAllSmartGoals(): Promise<ApiResponse<SmartGoal[]>> {
    return apiGet<SmartGoal[]>('/smart_goals');
  }

  async getSmartGoal(id: number): Promise<ApiResponse<SmartGoal>> {
    return apiGet<SmartGoal>(`/smart_goals/${id}`);
  }

  async createSmartGoal(data: CreateSmartGoalParams): Promise<ApiResponse<SmartGoal>> {
    return apiPost<SmartGoal>('/smart_goals', { smart_goal: data });
  }

  async createMultipleSmartGoals(goals: CreateSmartGoalParams[]): Promise<ApiResponse<SmartGoal[]>> {
    const promises = goals.map(goal => this.createSmartGoal(goal));
    const results = await Promise.all(promises);
    
    // Check if any requests failed
    const failedResults = results.filter(result => result.error);
    if (failedResults.length > 0) {
      return {
        error: `Failed to create ${failedResults.length} goals`,
        status: 400,
      };
    }
    
    return {
      data: results.map(result => result.data!).filter(Boolean),
      status: 200,
    };
  }

  async updateSmartGoal(id: number, data: UpdateSmartGoalParams): Promise<ApiResponse<SmartGoal>> {
    return apiPatch<SmartGoal>(`/smart_goals/${id}`, { smart_goal: data });
  }

  async deleteSmartGoal(id: number): Promise<ApiResponse<void>> {
    return apiDelete<void>(`/smart_goals/${id}`);
  }
} 