// API client for Rails server users and profiles endpoints
import { apiGet, apiPatch, type ApiResponse } from '../utils/apiRequest';

// User interface for authentication
export interface User {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

// Profile interface for user details
export interface Profile {
  id: number;
  first_name?: string;
  last_name?: string;
  work_role?: string;
  education?: string;
  desires?: string;
  limiting_beliefs?: string;
  timezone?: string;
  onboarding_status: 'incomplete' | 'complete';
  onboarding_completed_at?: string;
  onboarding_version?: 'v1' | 'v2';
  user_id: number;
  created_at: string;
  updated_at: string;
}

// Combined user response interface
export interface UserResponse {
  user: User;
  profile: Profile;
}

// Profile update data
export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  work_role?: string;
  education?: string;
  desires?: string;
  limiting_beliefs?: string;
  timezone?: string;
  onboarding_status?: 'incomplete' | 'complete';
  onboarding_version?: 'v1' | 'v2';
}

// Users API class
export class UsersAPI {
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return apiGet<UserResponse>('/me');
  }

  async getProfile(profileId: number): Promise<ApiResponse<Profile>> {
    return apiGet<Profile>(`/profiles/${profileId}`);
  }

  async updateProfile(profileId: number, data: ProfileUpdateData): Promise<ApiResponse<Profile>> {
    return apiPatch<Profile>(`/profiles/${profileId}`, { profile: data });
  }

  async completeOnboarding(profileId: number): Promise<ApiResponse<Profile>> {
    return apiPatch<Profile>(`/profiles/${profileId}/complete_onboarding`);
  }
} 