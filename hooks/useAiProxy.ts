import { useAuth } from '@/hooks/useAuth';
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
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getStoredApiKey } = useAiSettings();
  const queryClient = useQueryClient();
  
  // Poll for job status
  const jobStatus = useJobStatus(jobId);
  
  const mutation = useMutation({
    mutationFn: async ({ input, timeframe }: { input: string; timeframe?: string }) => {
      const userApiKey = await getStoredApiKey();
      
      // Step 1: Queue the job
      const response = await apiPost<JobQueuedResponse>('/ai/proxy', {
        input,
        timeframe: timeframe || null,
        user_provided_key: userApiKey || null,
        intent: "smart_goal"
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Step 2: Start polling for the job result and store usage info
      setJobId(response.data.job_id);
      setUsageInfo(response.data.usage_info);
      return response.data;
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to process AI request');
      setIsLoading(false);
    },
    onSuccess: () => {},
  });

  // Step 3: Handle the completed result
  useEffect(() => {
    const status = jobStatus.data?.status;
    const result = jobStatus.data?.result;
    
    if (status === 'complete' && result) {
      try {
        setAiResponse(result);
        setError(null);
        
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
        setError('Failed to parse AI proxy result');
        setJobId(null);
      } finally {
        setIsLoading(false);
      }
    } else if (status === 'failed') {
      setError('Failed to process AI request');
      setJobId(null);
    }
  }, [jobStatus.data, queryClient]);

  const processAiRequest = async (input: string, timeframe?: string) => {
    setIsLoading(true);
    setError(null);
    mutation.mutate({ input, timeframe });
  };

  return {
    aiResponse,
    usageInfo,
    jobStatus: jobStatus.data,
    isLoading: isLoading || mutation.isPending || (jobStatus.isLoading && !!jobId),
    error: error || mutation.error || jobStatus.error,
    progress: jobStatus.data?.progress || 0,
    isJobComplete: jobStatus.data?.status === 'complete',
    isJobFailed: jobStatus.data?.status === 'failed',
    processAiRequest,
  };
}; 