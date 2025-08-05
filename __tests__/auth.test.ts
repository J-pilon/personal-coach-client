import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { act, renderHook } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import React from 'react';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock TokenManager at module level
const mockGetValidToken = jest.fn();
const mockStoreToken = jest.fn();
const mockClearToken = jest.fn();

jest.mock('../utils/api', () => ({
  TokenManager: {
    getInstance: jest.fn(() => ({
      getValidToken: mockGetValidToken,
      storeToken: mockStoreToken,
      clearToken: mockClearToken,
    })),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should load stored authentication on mount', async () => {
    const mockToken = 'test-token';
    const mockUser = { 
      id: 1, 
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    const mockProfile = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      onboarding_status: 'complete' as const,
      user_id: 1,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    // Mock TokenManager methods
    mockGetValidToken.mockResolvedValue(mockToken);
    mockStoreToken.mockResolvedValue(undefined);
    mockClearToken.mockResolvedValue(undefined);
    
    // Mock SecureStore for user and profile
    mockSecureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(mockUser));
    mockSecureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(mockProfile));

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle sign in successfully', async () => {
    const mockToken = 'new-token';
    const mockUser = { 
      id: 1, 
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    const mockProfile = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      onboarding_status: 'complete' as const,
      user_id: 1,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ 
        status: { 
          code: 200,
          message: 'Logged in successfully.',
          data: {
            user: mockUser,
            profile: mockProfile
          }
        } 
      }),
      headers: {
        get: (header: string) => header === 'Authorization' ? `Bearer ${mockToken}` : null,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('auth_profile', JSON.stringify(mockProfile));
    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.profile).toEqual(mockProfile);
  });

  it('should handle sign out successfully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Set initial state
    await act(async () => {
      result.current.token = 'test-token';
      result.current.user = { 
        id: 1, 
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
      result.current.profile = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        onboarding_status: 'complete' as const,
        user_id: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };
    });

    const mockResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user');
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_profile');
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });
});