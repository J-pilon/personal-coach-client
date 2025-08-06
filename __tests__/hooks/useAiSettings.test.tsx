import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { useAiProxy, useAiSettings } from '../../hooks/useAiSettings';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock the API request
jest.mock('../../utils/apiRequest', () => ({
  apiPost: jest.fn(),
}));

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={mockQueryClient}>
    {children}
  </QueryClientProvider>
);

describe('useAiSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient.clear();
  });

  describe('API Key Management', () => {
    it('should get stored API key', async () => {
      const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
      mockGetItemAsync.mockResolvedValue('test-api-key');

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      const storedKey = await result.current.getStoredApiKey();
      expect(storedKey).toBe('test-api-key');
      expect(mockGetItemAsync).toHaveBeenCalledWith('openai_api_key');
    });

    it('should return null when no API key is stored', async () => {
      const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
      mockGetItemAsync.mockResolvedValue(null);

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      const storedKey = await result.current.getStoredApiKey();
      expect(storedKey).toBeNull();
    });

    it('should handle error when getting stored API key', async () => {
      const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
      mockGetItemAsync.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      const storedKey = await result.current.getStoredApiKey();
      expect(storedKey).toBeNull();
    });

    it('should set API key successfully', async () => {
      const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
      mockSetItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      await result.current.setApiKey('new-api-key');

      expect(mockSetItemAsync).toHaveBeenCalledWith('openai_api_key', 'new-api-key');
    });

    it('should clear API key successfully', async () => {
      const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;
      mockDeleteItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      await result.current.clearApiKey();

      expect(mockDeleteItemAsync).toHaveBeenCalledWith('openai_api_key');
    });
  });

  describe('Usage Info Fetching', () => {
    it('should fetch usage info without API key', async () => {
      const mockApiPost = require('../../utils/apiRequest').apiPost as jest.MockedFunction<any>;
      mockApiPost.mockResolvedValue({
        data: {
          usage_info: {
            using_own_key: false,
            remaining: 3,
            total_limit: 3,
          },
        },
      });

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.usageInfo).toEqual({
        using_own_key: false,
        remaining: 3,
        total_limit: 3,
      });
      expect(mockApiPost).toHaveBeenCalledWith('/ai/usage', undefined);
    });

    it('should fetch usage info with API key', async () => {
      const mockApiPost = require('../../utils/apiRequest').apiPost as jest.MockedFunction<any>;
      mockApiPost.mockResolvedValue({
        data: {
          usage_info: {
            using_own_key: true,
            remaining: Infinity,
          },
        },
      });

      const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
      mockGetItemAsync.mockResolvedValue('user-api-key');

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.usageInfo).toEqual({
        using_own_key: true,
        remaining: Infinity,
      });
      expect(mockApiPost).toHaveBeenCalledWith('/ai/usage', { user_provided_key: 'user-api-key' });
    });

    it('should handle API error when fetching usage info', async () => {
      const mockApiPost = require('../../utils/apiRequest').apiPost as jest.MockedFunction<any>;
      mockApiPost.mockResolvedValue({
        error: 'Failed to fetch usage info',
      });

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch usage info');
    });

    it('should handle network error when fetching usage info', async () => {
      const mockApiPost = require('../../utils/apiRequest').apiPost as jest.MockedFunction<any>;
      mockApiPost.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      const { result } = renderHook(() => useAiSettings(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('should show loading state during API key operations', async () => {
      const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
      mockSetItemAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      const setApiKeyPromise = result.current.setApiKey('test-key');
      expect(result.current.isLoading).toBe(true);

      await setApiKeyPromise;
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle setApiKey error', async () => {
      const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
      mockSetItemAsync.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      await expect(result.current.setApiKey('test-key')).rejects.toThrow('Storage error');
    });

    it('should handle clearApiKey error', async () => {
      const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;
      mockDeleteItemAsync.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useAiSettings(), { wrapper });

      await expect(result.current.clearApiKey()).rejects.toThrow('Storage error');
    });
  });
});

describe('useAiProxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient.clear();
  });

  it('should make AI proxy request without API key', async () => {
    const mockApiPost = require('../../utils/apiRequest').apiPost as jest.MockedFunction<any>;
    mockApiPost.mockResolvedValue({
      data: {
        intent: 'smart_goal',
        response: { specific: 'Test goal' },
        context_used: true,
        request_id: 1,
        usage_info: {
          using_own_key: false,
          remaining: 2,
        },
      },
    });

    const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
    mockGetItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    const response = await result.current.mutateAsync('Create a SMART goal');

    expect(response).toEqual({
      intent: 'smart_goal',
      response: { specific: 'Test goal' },
      context_used: true,
      request_id: 1,
      usage_info: {
        using_own_key: false,
        remaining: 2,
      },
    });

    expect(mockApiPost).toHaveBeenCalledWith('/ai/proxy', {
      input: 'Create a SMART goal',
      user_provided_key: null,
    });
  });

  it('should make AI proxy request with API key', async () => {
    const mockApiPost = require('../../utils/apiRequest').apiPost as jest.MockedFunction<any>;
    mockApiPost.mockResolvedValue({
      data: {
        intent: 'prioritization',
        response: { tasks: ['Task 1', 'Task 2'] },
        context_used: false,
        request_id: 2,
        usage_info: {
          using_own_key: true,
          remaining: Infinity,
        },
      },
    });

    const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
    mockGetItemAsync.mockResolvedValue('user-api-key');

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    const response = await result.current.mutateAsync('Prioritize my tasks');

    expect(response).toEqual({
      intent: 'prioritization',
      response: { tasks: ['Task 1', 'Task 2'] },
      context_used: false,
      request_id: 2,
      usage_info: {
        using_own_key: true,
        remaining: Infinity,
      },
    });

    expect(mockApiPost).toHaveBeenCalledWith('/ai/proxy', {
      input: 'Prioritize my tasks',
      user_provided_key: 'user-api-key',
    });
  });

  it('should handle API error in proxy request', async () => {
    const mockApiPost = require('../../utils/apiRequest').apiPost as jest.MockedFunction<any>;
    mockApiPost.mockResolvedValue({
      error: 'AI service unavailable',
    });

    const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
    mockGetItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    await expect(result.current.mutateAsync('Test input')).rejects.toThrow('AI service unavailable');
  });

  it('should handle network error in proxy request', async () => {
    const mockApiPost = require('../../utils/apiRequest').apiPost as jest.MockedFunction<any>;
    mockApiPost.mockRejectedValue(new Error('Network error'));

    const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
    mockGetItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    await expect(result.current.mutateAsync('Test input')).rejects.toThrow('Network error');
  });

  it('should handle missing data in proxy response', async () => {
    const mockApiPost = require('../../utils/apiRequest').apiPost as jest.MockedFunction<any>;
    mockApiPost.mockResolvedValue({});

    const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
    mockGetItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    await expect(result.current.mutateAsync('Test input')).rejects.toThrow('No data received from server');
  });
}); 