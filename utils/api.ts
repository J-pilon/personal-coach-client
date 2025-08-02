/**
 * JWT Token Authentication System
 * 
 * This module provides a comprehensive JWT token management system for the client-side
 * application. It follows the Token Authorization pattern with the following features:
 * 
 * 1. **TokenManager**: Singleton class that handles token storage, validation, and refresh
 * 2. **Automatic Token Validation**: Checks token expiration and validity before each request
 * 3. **Token Refresh**: Automatically refreshes tokens that are expiring soon
 * 4. **Centralized Authentication**: All API requests use the same authentication system
 * 5. **Error Handling**: Proper handling of 401/403 responses with automatic token cleanup
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
 *   "exp": 1753908204   // expiration time
 * }
 */

import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/api/v1';

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
  private tokenRefreshPromise: Promise<string> | null = null;

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

  // Check if token will expire soon (within 5 minutes)
  private isTokenExpiringSoon(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;
    return payload.exp < (currentTime + fiveMinutes);
  }

  // Get valid token with refresh logic
  async getValidToken(): Promise<string | null> {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) return null;

    // If token is expired, clear it and return null
    if (this.isTokenExpired(token)) {
      await this.clearToken();
      return null;
    }

    // If token is expiring soon, try to refresh it
    if (this.isTokenExpiringSoon(token)) {
      return this.refreshToken(token);
    }

    return token;
  }

  // Refresh token (placeholder for future implementation)
  private async refreshToken(currentToken: string): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this.performTokenRefresh(currentToken);
    
    try {
      const newToken = await this.tokenRefreshPromise;
      return newToken;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  // Perform actual token refresh
  private async performTokenRefresh(currentToken: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const newToken = response.headers.get('Authorization')?.replace('Bearer ', '');
        if (newToken) {
          await SecureStore.setItemAsync('auth_token', newToken);
          return newToken;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // If refresh fails, return current token (it might still be valid)
    return currentToken;
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

  // Handle 401 Unauthorized - token might be invalid
  if (response.status === 401) {
    await tokenManager.clearToken();
    throw new Error('Authentication failed. Please sign in again.');
  }

  // Handle 403 Forbidden - token might be expired
  if (response.status === 403) {
    await tokenManager.clearToken();
    throw new Error('Access denied. Please sign in again.');
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