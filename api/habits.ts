import type { CreateHabitParams, HabitModel } from '../models/habit';
import { apiPost, type ApiResponse } from '../utils/apiRequest';

export class HabitsAPI {
  async createBulk(
    smart_goal_id: number,
    habits: CreateHabitParams[],
  ): Promise<ApiResponse<HabitModel[]>> {
    return apiPost<HabitModel[]>('/habits', {
      smart_goal_id,
      habits,
    });
  }
}

export const habitsApi = new HabitsAPI();
