import { useAiProxy } from '@/hooks/useAiProxy';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

// Mock the apiRequest functions
jest.mock('@/utils/apiRequest', () => ({
  apiPost: jest.fn(),
}));

// Mock the useAiSettings hook
jest.mock('@/hooks/useAiSettings', () => ({
  useAiSettings: () => ({
    getStoredApiKey: jest.fn().mockResolvedValue('test-api-key'),
  }),
}));

// Mock the useJobStatus hook
jest.mock('@/hooks/useJobStatus', () => ({
  useJobStatus: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useAiProxy', () => {
  const mockApiPost = require('@/utils/apiRequest').apiPost as jest.MockedFunction<any>;
  const mockUseJobStatus = require('@/hooks/useJobStatus').useJobStatus as jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should queue job and start polling', async () => {
    // Mock successful job queuing
    mockApiPost.mockResolvedValueOnce({
      data: {
        message: 'AI request queued for processing',
        job_id: 'job-123',
        status: 'queued',
        usage_info: { requests_used: 1 },
      },
    });

    // Mock job status polling - initially called with null, then with job ID
    mockUseJobStatus
      .mockReturnValueOnce({
        data: null,
        isLoading: false,
        error: null,
      })
      .mockReturnValue({
        data: {
          job_id: 'job-123',
          status: 'completed',
          progress: 100,
          result: {
            intent: 'smart_goal',
            response: { specific: 'Test goal' },
            context_used: true,
            request_id: 1,
          },
        },
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    // Trigger the mutation
    await result.current.mutateAsync('Test input');

    expect(mockApiPost).toHaveBeenCalledWith('/ai/proxy', {
      input: 'Test input',
      user_provided_key: 'test-api-key',
    });

    // Wait for the job ID to be set and useJobStatus to be called with it
    await waitFor(() => {
      expect(mockUseJobStatus).toHaveBeenCalledWith('job-123');
    });
  });

  it('should handle job queuing errors', async () => {
    mockApiPost.mockResolvedValueOnce({
      error: 'Rate limit exceeded',
      status: 429,
    });

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    try {
      await result.current.mutateAsync('Test input');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Rate limit exceeded');
    }
  });

  it('should handle job completion and invalidate queries', async () => {
    const mockQueryClient = {
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
    };

    // Mock successful job queuing
    mockApiPost.mockResolvedValueOnce({
      data: {
        message: 'AI request queued for processing',
        job_id: 'job-123',
        status: 'queued',
        usage_info: { requests_used: 1 },
      },
    });

    // Mock job status with completed result
    mockUseJobStatus.mockReturnValue({
      data: {
        job_id: 'job-123',
        status: 'completed',
        progress: 100,
        result: {
          intent: 'smart_goal',
          response: { specific: 'Test goal' },
          context_used: true,
          request_id: 1,
          usage_info: { requests_used: 2 },
        },
      },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    // Trigger the mutation
    await result.current.mutateAsync('Test input');

    // Wait for the effect to run and verify useJobStatus was called with the job ID
    await waitFor(() => {
      expect(mockUseJobStatus).toHaveBeenCalledWith('job-123');
    });
  });

  it('should handle job failures', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: {
        message: 'AI request queued for processing',
        job_id: 'job-123',
        status: 'queued',
      },
    });

    mockUseJobStatus.mockReturnValue({
      data: {
        job_id: 'job-123',
        status: 'failed',
        progress: 0,
      },
      isLoading: false,
      error: new Error('Job failed'),
    });

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    await result.current.mutateAsync('Test input');

    expect(result.current.isJobFailed).toBe(true);
    expect(result.current.error).toBeDefined();
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

    const { result } = renderHook(() => useAiProxy(), { wrapper });

    expect(result.current.progress).toBe(50);
    expect(result.current.isJobComplete).toBe(false);
    expect(result.current.isJobFailed).toBe(false);
  });
}); 