import { useJobStatus } from '@/hooks/useJobStatus';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

// Mock the apiGet function
jest.mock('@/utils/apiRequest', () => ({
  apiGet: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useJobStatus', () => {
  const mockApiGet = require('@/utils/apiRequest').apiGet as jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should poll job status until completion', async () => {
    // Mock initial queued status
    mockApiGet.mockResolvedValueOnce({
      data: {
        job_id: 'job-123',
        status: 'queued',
        progress: 0,
      },
    });

    // Mock working status
    mockApiGet.mockResolvedValueOnce({
      data: {
        job_id: 'job-123',
        status: 'working',
        progress: 50,
      },
    });

    // Mock completed status
    mockApiGet.mockResolvedValueOnce({
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
    });

    const { result } = renderHook(() => useJobStatus('job-123'), { wrapper });

    // Should start with queued status
    await waitFor(() => {
      expect(result.current.data?.status).toBe('queued');
    });

    // Should eventually complete
    await waitFor(() => {
      expect(result.current.data?.status).toBe('completed');
    }, { timeout: 10000 });

    expect(mockApiGet).toHaveBeenCalledTimes(3);
  });

  it('should handle job failures', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        job_id: 'job-123',
        status: 'failed',
        progress: 0,
      },
    });

    const { result } = renderHook(() => useJobStatus('job-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.data?.status).toBe('failed');
    });
  });

  it('should not poll when jobId is null', () => {
    const { result } = renderHook(() => useJobStatus(null), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    mockApiGet.mockResolvedValueOnce({
      error: 'Job not found',
      status: 404,
    });

    const { result } = renderHook(() => useJobStatus('job-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
}); 