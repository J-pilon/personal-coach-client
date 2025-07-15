// API client for Rails server users and profiles endpoints
// Base URL for the Rails server API
const API_BASE_URL = 'http://localhost:3000/api/v1';

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
  onboarding_status: 'incomplete' | 'complete';
  onboarding_completed_at?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// Combined user response interface
export interface UserResponse {
  user: User;
  profile: Profile;
}

// User registration data
export interface UserRegistrationData {
  email: string;
  password: string;
  password_confirmation: string;
}

// Profile update data
export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  work_role?: string;
  education?: string;
  desires?: string;
  limiting_beliefs?: string;
  onboarding_status?: 'incomplete' | 'complete';
}

// User authentication functions
export const createUser = async (data: UserRegistrationData): Promise<UserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user: data }),
  });
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  return response.json();
};

export const getUser = async (userId: number = 1): Promise<UserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

// Profile functions
export const getProfile = async (profileId: number = 1): Promise<Profile> => {
  const response = await fetch(`${API_BASE_URL}/profiles/${profileId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

export const updateProfile = async (profileId: number = 1, data: ProfileUpdateData): Promise<Profile> => {
  const response = await fetch(`${API_BASE_URL}/profiles/${profileId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profile: data }),
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  return response.json();
};

export const completeOnboarding = async (profileId: number = 1): Promise<Profile> => {
  const response = await fetch(`${API_BASE_URL}/profiles/${profileId}/complete_onboarding`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to complete onboarding');
  }
  return response.json();
}; 