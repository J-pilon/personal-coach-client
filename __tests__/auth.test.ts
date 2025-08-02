import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
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
    
    mockSecureStore.getItemAsync
      .mockResolvedValueOnce(mockToken)
      .mockResolvedValueOnce(JSON.stringify(mockUser));

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
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
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: mockUser }),
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

    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', mockToken);
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
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
    });

    const mockResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user');
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });
});