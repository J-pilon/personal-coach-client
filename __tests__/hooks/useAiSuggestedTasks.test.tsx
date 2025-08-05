import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AiTaskSuggestion, useAiSuggestedTasks } from '../../hooks/useAiSuggestedTasks';
import { AuthProvider } from '../../hooks/useAuth';

// Mock the apiRequest utility
jest.mock('../../utils/apiRequest', () => ({
  apiPost: jest.fn(),
}));

// Mock the AuthProvider to avoid async initialization
jest.mock('../../hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockApiPost = require('../../utils/apiRequest').apiPost;

describe('useAiSuggestedTasks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockApiPost.mockClear();
  });

  const mockSuggestions: AiTaskSuggestion[] = [
    {
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the current project',
      goal_id: 'goal-1',
      time_estimate_minutes: 60,
    },
    {
      title: 'Review code changes',
      description: 'Review and approve pending pull requests',
      goal_id: 'goal-2',
      time_estimate_minutes: 30,
    },
  ];

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthProvider>
    );
    Wrapper.displayName = 'TestWrapper';
    return Wrapper;
  };

  it('should initialize with empty suggestions and not loading', () => {
    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should generate suggestions successfully', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: mockSuggestions,
      status: 200,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(mockApiPost).toHaveBeenCalledWith('/ai/suggested_tasks', { profile_id: 1 });
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Failed to generate suggestions';
    mockApiPost.mockResolvedValueOnce({
      error: errorMessage,
      status: 500,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should dismiss a suggestion', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: mockSuggestions,
      status: 200,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(2);
    });

    act(() => {
      result.current.dismissSuggestion(mockSuggestions[0]);
    });

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(1);
      expect(result.current.suggestions[0]).toEqual(mockSuggestions[1]);
    });
  });

  it('should clear all suggestions', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: mockSuggestions,
      status: 200,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(2);
    });

    act(() => {
      result.current.clearSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle loading state correctly', async () => {
    let resolveApiPost: (value: { data: AiTaskSuggestion[]; status: number }) => void;
    const apiPostPromise = new Promise<{ data: AiTaskSuggestion[]; status: number }>((resolve) => {
      resolveApiPost = resolve;
    });

    mockApiPost.mockReturnValueOnce(apiPostPromise);

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.generateSuggestions();
    });

    expect(result.current.isLoading).toBe(true);

    // Resolve the apiPost
    resolveApiPost!({
      data: mockSuggestions,
      status: 200,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.suggestions).toEqual(mockSuggestions);
    });
  });

  it('should handle empty response data', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: [],
      status: 200,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle null response data', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: null,
      status: 200,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should use different profile IDs correctly', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: mockSuggestions,
      status: 200,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(123), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions);
    });

    expect(mockApiPost).toHaveBeenCalledWith(
      '/ai/suggested_tasks',
      { profile_id: 123 }
    );
  });

  it('should handle addToToday and addForLater methods', () => {
    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    const suggestion = mockSuggestions[0];

    // These methods should return the suggestion (handled by parent component)
    expect(result.current.addToToday(suggestion)).toEqual(suggestion);

    // addForLater is async but should also return the suggestion
    expect(result.current.addForLater(suggestion)).resolves.toEqual(suggestion);
  });
}); 