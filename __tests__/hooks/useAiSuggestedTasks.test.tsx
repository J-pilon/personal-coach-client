import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AiTaskSuggestion, useAiSuggestedTasks } from '../../hooks/useAiSuggestedTasks';
import { AuthProvider } from '../../hooks/useAuth';

// Mock the apiRequest utility
jest.mock('../../utils/apiRequest', () => ({
  apiPost: jest.fn(),
}));

// Mock the useJobStatus hook
jest.mock('../../hooks/useJobStatus', () => ({
  useJobStatus: jest.fn(),
}));

// Mock the useAiSettings hook
jest.mock('../../hooks/useAiSettings', () => ({
  useAiSettings: () => ({
    getStoredApiKey: jest.fn().mockResolvedValue('test-api-key'),
  }),
}));

// Mock the AuthProvider to avoid async initialization
jest.mock('../../hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockApiPost = require('../../utils/apiRequest').apiPost;
const mockUseJobStatus = require('../../hooks/useJobStatus').useJobStatus;

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
    mockUseJobStatus.mockClear();
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

  const mockUsageInfo = {
    using_own_key: false,
    remaining: 2,
    total_limit: 3,
    reset_time: '2024-01-01T00:00:00Z',
  };

  const mockJobQueuedResponse = {
    message: 'AI request queued for processing',
    job_id: 'job-123',
    status: 'queued',
    usage_info: mockUsageInfo,
  };

  const mockJobCompletedResponse = {
    job_id: 'job-123',
    status: 'complete',
    progress: 100,
    result: mockSuggestions,
  };

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
    mockUseJobStatus.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should generate suggestions successfully', async () => {
    // Mock successful job queuing
    mockApiPost.mockResolvedValueOnce({
      data: mockJobQueuedResponse,
    });

    // Mock job status polling - initially called with null, then with job ID
    mockUseJobStatus
      .mockReturnValueOnce({
        data: null,
        isLoading: false,
        error: null,
      })
      .mockReturnValue({
        data: mockJobCompletedResponse,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    expect(mockApiPost).toHaveBeenCalledWith('/ai/suggested_tasks', {
      user_provided_key: 'test-api-key',
    });

    // Wait for the job to complete and suggestions to be set
    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions);
      expect(result.current.usageInfo).toEqual(mockUsageInfo);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Failed to generate suggestions';
    mockApiPost.mockResolvedValueOnce({
      error: errorMessage,
    });

    mockUseJobStatus.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.usageInfo).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should dismiss a suggestion', async () => {
    // Mock successful job queuing
    mockApiPost.mockResolvedValueOnce({
      data: mockJobQueuedResponse,
    });

    // Mock job status with completed result
    mockUseJobStatus.mockReturnValue({
      data: mockJobCompletedResponse,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
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
    // Mock successful job queuing
    mockApiPost.mockResolvedValueOnce({
      data: mockJobQueuedResponse,
    });

    // Mock job status with completed result
    mockUseJobStatus.mockReturnValue({
      data: mockJobCompletedResponse,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
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
      expect(result.current.usageInfo).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle loading state correctly', async () => {
    let resolveApiPost: (value: { data: any }) => void;
    const apiPostPromise = new Promise<{ data: any }>((resolve) => {
      resolveApiPost = resolve;
    });

    mockApiPost.mockReturnValueOnce(apiPostPromise);

    mockUseJobStatus.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.generateSuggestions();
    });

    expect(result.current.isLoading).toBe(true);

    // Resolve the apiPost with job queued response
    resolveApiPost!({
      data: mockJobQueuedResponse,
    });

    // Mock job completion
    mockUseJobStatus.mockReturnValue({
      data: mockJobCompletedResponse,
      isLoading: false,
      error: null,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.suggestions).toEqual(mockSuggestions);
      expect(result.current.usageInfo).toEqual(mockUsageInfo);
    });
  });

  it('should handle job failure', async () => {
    // Mock successful job queuing
    mockApiPost.mockResolvedValueOnce({
      data: mockJobQueuedResponse,
    });

    // Mock job status - first call with null, then with failed result
    mockUseJobStatus
      .mockReturnValueOnce({
        data: null,
        isLoading: false,
        error: null,
      })
      .mockReturnValue({
        data: {
          job_id: 'job-123',
          status: 'failed',
          progress: 0,
        },
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to generate task suggestions');
      expect(result.current.isJobFailed).toBe(true);
    });
  });

  it('should expose progress and status information', () => {
    mockUseJobStatus.mockReturnValue({
      data: {
        job_id: 'job-123',
        status: 'working',
        progress: 50,
      },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
      wrapper: createWrapper(),
    });

    expect(result.current.progress).toBe(50);
    expect(result.current.isJobComplete).toBe(false);
    expect(result.current.isJobFailed).toBe(false);
  });

  it('should use different profile IDs correctly', async () => {
    // Mock successful job queuing
    mockApiPost.mockResolvedValueOnce({
      data: mockJobQueuedResponse,
    });

    // Mock job status with completed result
    mockUseJobStatus.mockReturnValue({
      data: mockJobCompletedResponse,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.generateSuggestions();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions);
      expect(result.current.usageInfo).toEqual(mockUsageInfo);
    });

    expect(mockApiPost).toHaveBeenCalledWith(
      '/ai/suggested_tasks',
      {
        user_provided_key: 'test-api-key',
      }
    );
  });

  it('should handle addToToday and addForLater methods', () => {
    mockUseJobStatus.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAiSuggestedTasks(), {
      wrapper: createWrapper(),
    });

    const suggestion = mockSuggestions[0];

    // These methods should return the suggestion (handled by parent component)
    expect(result.current.addToToday(suggestion)).toEqual(suggestion);

    // addForLater is async but should also return the suggestion
    expect(result.current.addForLater(suggestion)).resolves.toEqual(suggestion);
  });
}); 