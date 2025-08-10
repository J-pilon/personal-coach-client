import { apiPost } from '@/utils/apiRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAiSettings } from './useAiSettings';
import { useJobStatus } from './useJobStatus';

interface JobQueuedResponse {
  message: string;
  job_id: string;
  status: 'queued';
  usage_info: any;
}

interface AiProxyResponse {
  intent: 'smart_goal' | 'prioritization' | 'error';
  response: any;
  context_used: boolean;
  request_id: number;
  usage_info: any;
}

export const useAiProxy = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const { getStoredApiKey } = useAiSettings();
  const queryClient = useQueryClient();
  
  // Poll for job status
  const jobStatus = useJobStatus(jobId);
  const mutation = useMutation({
    mutationFn: async (input: string) => {
      const userApiKey = await getStoredApiKey();
      
      // Step 1: Queue the job
      const response = await apiPost<JobQueuedResponse>('/ai/proxy', {
        input,
        user_provided_key: userApiKey || null,
        intent: "smart_goal"
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Update usage info in cache
      if (response.data.usage_info) {
        queryClient.setQueryData(['ai-usage'], response.data.usage_info);
      }

      // Step 2: Start polling for the job result
      setJobId(response.data.job_id);
      return response.data;
    },
  });

  // Step 3: Handle the completed result
  useEffect(() => {
    if (jobStatus.data?.status === 'complete' && jobStatus.data?.result) {
      try {
        const result = jobStatus.data.result;
        
        // Invalidate relevant queries based on the intent
        if (result.intent === 'smart_goal') {
          queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
        } else if (result.intent === 'prioritization') {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
        
        // Clear the job ID to stop polling
        setJobId(null);
      } catch (error) {
        console.error('Failed to parse AI proxy result:', error);
        // Clear the job ID to stop polling on error
        setJobId(null);
      }
    }
  }, [jobStatus.data, queryClient]);

  return {
    ...mutation,
    jobStatus: jobStatus.data,
    isLoading: mutation.isPending || (jobStatus.isLoading && !!jobId),
    error: mutation.error || jobStatus.error,
    // Expose job progress for UI feedback
    progress: jobStatus.data?.progress || 0,
    isJobComplete: jobStatus.data?.status === 'complete',
    isJobFailed: jobStatus.data?.status === 'failed',
  };
}; 