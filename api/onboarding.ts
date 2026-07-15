import type {
  DiscoveryMessageResponse,
  OnboardingResumeResponse,
  StartDiscoveryResponse,
  SuggestHabitsResponse,
} from '../models/onboardingDiscovery';
import { apiGet, apiPost, type ApiResponse } from '../utils/apiRequest';

export interface SuggestHabitsParams {
  smart_goal_id: number;
  exclude?: string[];
  position?: 1 | 2 | 3;
}

export class OnboardingAPI {
  async resume(): Promise<ApiResponse<OnboardingResumeResponse>> {
    return apiGet<OnboardingResumeResponse>('/onboarding/resume');
  }

  async startDiscovery(): Promise<ApiResponse<StartDiscoveryResponse>> {
    return apiPost<StartDiscoveryResponse>('/onboarding/discovery/sessions', {});
  }

  async postDiscoveryMessage(
    session_id: number,
    text: string,
  ): Promise<ApiResponse<DiscoveryMessageResponse>> {
    return apiPost<DiscoveryMessageResponse>('/onboarding/discovery/messages', {
      session_id,
      text,
    });
  }

  async suggestHabits(
    params: SuggestHabitsParams,
  ): Promise<ApiResponse<SuggestHabitsResponse>> {
    return apiPost<SuggestHabitsResponse>('/onboarding/habits/suggest', params);
  }
}

export const onboardingApi = new OnboardingAPI();
