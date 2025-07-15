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
  const response = await fetch(`${API_BASE_URL}/smart_goals`);
  if (!response.ok) {
    throw new Error('Failed to fetch smart goals');
  }
  return response.json();
};

export const createSmartGoal = async (data: CreateSmartGoalParams): Promise<SmartGoal> => {
  const response = await fetch(`${API_BASE_URL}/smart_goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ smart_goal: data }),
  });
  if (!response.ok) {
    throw new Error('Failed to create smart goal');
  }
  return response.json();
};

export const createMultipleSmartGoals = async (goals: CreateSmartGoalParams[]): Promise<SmartGoal[]> => {
  const promises = goals.map(goal => createSmartGoal(goal));
  return Promise.all(promises);
};

export const updateSmartGoal = async (id: number, data: UpdateSmartGoalParams): Promise<SmartGoal> => {
  const response = await fetch(`${API_BASE_URL}/smart_goals/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ smart_goal: data }),
  });
  if (!response.ok) {
    throw new Error('Failed to update smart goal');
  }
  return response.json();
};

export const deleteSmartGoal = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/smart_goals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete smart goal');
  }
}; 