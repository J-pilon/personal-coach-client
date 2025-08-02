// API client for Rails server smart goals endpoints
// Base URL for the Rails server API
const API_BASE_URL = 'http://localhost:3000/api/v1';

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

export const getSmartGoals = async (): Promise<SmartGoal[]> => {
  const { apiRequest } = await import('../utils/api');
  return apiRequest('/smart_goals');
};

export const createSmartGoal = async (data: CreateSmartGoalParams): Promise<SmartGoal> => {
  const { apiRequest } = await import('../utils/api');
  return apiRequest('/smart_goals', {
    method: 'POST',
    body: JSON.stringify({ smart_goal: data }),
  });
};

export const createMultipleSmartGoals = async (goals: CreateSmartGoalParams[]): Promise<SmartGoal[]> => {
  const promises = goals.map(goal => createSmartGoal(goal));
  return Promise.all(promises);
};

export const updateSmartGoal = async (id: number, data: UpdateSmartGoalParams): Promise<SmartGoal> => {
  const { apiRequest } = await import('../utils/api');
  return apiRequest(`/smart_goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ smart_goal: data }),
  });
};

export const deleteSmartGoal = async (id: number): Promise<void> => {
  const { apiRequest } = await import('../utils/api');
  return apiRequest(`/smart_goals/${id}`, {
    method: 'DELETE',
  });
}; 