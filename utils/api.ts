/**
 * JWT Token Authentication System
 * 
 * This module provides a comprehensive JWT token management system for the client-side
 * application. It follows the Token Authorization pattern with the following features:
 * 
 * 1. **TokenManager**: Singleton class that handles token storage and validation
 * 2. **Automatic Token Validation**: Checks token expiration before each request
 * 3. **No Token Refresh**: Uses JTI revocation strategy - tokens are not refreshed
 * 4. **Centralized Authentication**: All API requests use the same authentication system
 * 5. **Error Handling**: Proper handling of 401 responses with automatic token cleanup
 * 
 * Usage:
 * - All API calls automatically include JWT tokens via getAuthHeaders()
 * - Token validation happens automatically on each request
 * - Use debugToken() to inspect token payload and expiration
 * - Use testAuth() to verify authentication is working
 * 
 * JWT Token Structure (from server):
 * {
 *   "jti": "unique-jwt-id",
 *   "sub": "user-id",
 *   "scp": "api_v1_user",
 *   "aud": null,
 *   "iat": 1753906404,  // issued at
 *   "exp": 1753908204   // expiration time (8 hours)
 * }
 */

import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Profile interface for stored profile data
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

// JWT Token interface
interface JWTPayload {
  sub: string; // user id
  exp: number; // expiration time
  iat: number; // issued at
  jti: string; // JWT ID
  scp: string; // scope
  aud?: string; // audience
}

// Token validation and management
export class TokenManager {
  private static instance: TokenManager;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Decode JWT token without verification (for client-side validation)
  decodeToken(token: string): JWTPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Get token payload for debugging
  async getTokenPayload(): Promise<JWTPayload | null> {
    const token = await this.getValidToken();
    return token ? this.decodeToken(token) : null;
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }



  // Get valid token with expiration check only
  async getValidToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (!token) {
        return null;
      }

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.log('Token is expired, clearing...');
        await this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  }

  // Clear stored token
  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
  }

  // Store new token
  async storeToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('auth_token', token);
  }
}

// Get authentication headers with token
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const tokenManager = TokenManager.getInstance();
  const token = await tokenManager.getValidToken();
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Enhanced API request function with JWT token handling
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const tokenManager = TokenManager.getInstance();
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized - token is invalid or expired
  if (response.status === 401) {
    await tokenManager.clearToken();
    throw new Error('Authentication failed. Please sign in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.status?.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Helper function to get current user ID from token
export const getCurrentUserId = async (): Promise<number | null> => {
  const tokenManager = TokenManager.getInstance();
  const token = await tokenManager.getValidToken();
  
  if (!token) return null;
  
  const payload = tokenManager.decodeToken(token);
  return payload ? parseInt(payload.sub, 10) : null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const tokenManager = TokenManager.getInstance();
  const token = await tokenManager.getValidToken();
  return !!token;
};

// Helper function to get stored profile data from SecureStore
export const getStoredProfile = async (): Promise<Profile | null> => {
  try {
    const storedProfile = await SecureStore.getItemAsync('auth_profile');
    if (!storedProfile) {
      return null;
    }
    return JSON.parse(storedProfile);
  } catch (error) {
    console.error('Error getting stored profile:', error);
    return null;
  }
};

// Debug utility functions
export const debugToken = async (): Promise<void> => {
  const tokenManager = TokenManager.getInstance();
  const payload = await tokenManager.getTokenPayload();
  
  if (!payload) {
    console.log('No valid token found');
    return;
  }
  
  console.log('Token payload:', payload);
  console.log('Token expires at:', new Date(payload.exp * 1000));
  console.log('Is expired:', payload.exp < Math.floor(Date.now() / 1000));
};