import type {
  CreateHabitCompletionParams,
  HabitCompletionModel,
} from '../models/habitCompletion';
import { apiPost, type ApiResponse } from '../utils/apiRequest';

export class HabitCompletionsAPI {
  async create(
    params: CreateHabitCompletionParams,
  ): Promise<ApiResponse<HabitCompletionModel>> {
    return apiPost<HabitCompletionModel>('/habit_completions', {
      habit_completion: params,
    });
  }
}

export const habitCompletionsApi = new HabitCompletionsAPI();
