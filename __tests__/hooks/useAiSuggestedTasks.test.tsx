import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AiTaskSuggestion, useAiSuggestedTasks } from '../../hooks/useAiSuggestedTasks';
import { AuthProvider } from '../../hooks/useAuth';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('useAiSuggestedTasks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockFetch.mockClear();
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
    return ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthProvider>
    );
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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockSuggestions,
    } as Response);

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

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/ai/suggested_tasks',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_id: 1 }),
      }
    );
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Failed to generate suggestions';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: errorMessage }),
    } as Response);

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

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should dismiss a suggestion', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockSuggestions,
    } as Response);

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    // First generate suggestions
    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(2);
    });

    // Then dismiss one suggestion
    act(() => {
      result.current.dismissSuggestion(mockSuggestions[0]);
    });

    expect(result.current.suggestions).toHaveLength(1);
    expect(result.current.suggestions[0]).toEqual(mockSuggestions[1]);
  });

  it('should clear all suggestions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockSuggestions,
    } as Response);

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    // First generate suggestions
    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(2);
    });

    // Then clear all suggestions
    act(() => {
      result.current.clearSuggestions();
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state correctly', async () => {
    let resolveFetch: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    mockFetch.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useAiSuggestedTasks(1), {
      wrapper: createWrapper(),
    });

    // Start generating suggestions
    act(() => {
      result.current.generateSuggestions();
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);

    // Resolve the fetch
    resolveFetch!({
      ok: true,
      status: 200,
      json: async () => mockSuggestions,
    } as Response);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle empty response data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => null,
    } as Response);

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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockSuggestions,
    } as Response);

    const { result } = renderHook(() => useAiSuggestedTasks(123), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/ai/suggested_tasks',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_id: 123 }),
      }
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