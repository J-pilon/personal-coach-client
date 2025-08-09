import { MultiPeriodSmartGoalResponse } from '@/api/ai';
import { apiGet } from '@/utils/apiRequest';
import { useQuery } from '@tanstack/react-query';
import { AiTaskSuggestion } from '@/hooks/useAiSuggestedTasks';

export interface AiServiceResponse {
  intent?: string,
  response: MultiPeriodSmartGoalResponse | AiTaskSuggestion[]
}

export interface JobStatusResponse {
  job_id: string;
  status: 'queued' | 'working' | 'complete' | 'failed' | 'unknown';
  progress: number;
  result?: AiServiceResponse
}

export const useJobStatus = (jobId: string | null) => {
  return useQuery({
    queryKey: ['job-status', jobId],
    queryFn: async (): Promise<JobStatusResponse | undefined | null> => {
      if (!jobId) return null;
      
      const response = await apiGet<JobStatusResponse>(`/jobs/${jobId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    },
    enabled: !!jobId,
    refetchInterval: (data) => {
      if (data?.state?.data?.status === 'complete' || data?.state?.data?.status === 'failed') {
        return false;
      }
      
      // Gradual backoff: start at 500ms, increase by 500ms each time, max 5s
      const attemptCount = data?.state?.dataUpdateCount || 0;
      const baseInterval = 500;
      const maxInterval = 5000;
      
      return Math.min(baseInterval + (attemptCount * baseInterval), maxInterval);
    },
    retry: false,
    staleTime: 0,
  });
}; 