import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiPost } from '../utils/apiRequest';
import { useAiSettings } from './useAiSettings';
import { useJobStatus } from './useJobStatus';

// Interface for AI-generated task suggestions
export interface AiTaskSuggestion {
  title: string;
  description: string | null;
  goal_id: string | null;
  time_estimate_minutes: number;
}

// Interface for usage information
export interface UsageInfo {
  using_own_key: boolean;
  remaining: number;
  total_limit?: number;
  reset_time?: string;
}

// Interface for the API response
export interface SuggestedTasksResponse {
  suggestions: AiTaskSuggestion[];
  usage_info: UsageInfo;
}

// Interface for job queued response
interface JobQueuedResponse {
  message: string;
  job_id: string;
  status: 'queued';
  usage_info: any;
}

export const useAiSuggestedTasks = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AiTaskSuggestion[]>([]);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getStoredApiKey } = useAiSettings();
  const queryClient = useQueryClient();
  const jobStatus = useJobStatus(jobId);

  const mutation = useMutation({
    mutationFn: async () => {
      const userApiKey = await getStoredApiKey();
      
      // Step 1: Queue the job
      const response = await apiPost<JobQueuedResponse>('/ai/suggested_tasks', { 
        user_provided_key: userApiKey || null,
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
      setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
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
        if (result.intent === 'task_suggestions' && Array.isArray(result.response)) {
          setSuggestions(result.response);
          setError(null);
          
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          
          setJobId(null);
          setIsLoading(false);
        } else {
          throw new Error('Unexpected result format');
        }
      } catch (error) {
        console.error('Failed to parse task suggestions result:', error);
        setError('Failed to parse task suggestions');
        setJobId(null);
        setIsLoading(false);
      }
    } else if (status === 'failed') {
      setError('Failed to generate task suggestions');
      setJobId(null);
      setIsLoading(false);
    }
  }, [jobStatus.data, queryClient]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    mutation.mutate();
  };

  const addToToday = (suggestion: AiTaskSuggestion) => {
    return suggestion;
  };

  const addForLater = async (suggestion: AiTaskSuggestion) => {
    return suggestion;
  };

  const dismissSuggestion = (suggestion: AiTaskSuggestion) => {
    setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setUsageInfo(null);
    setError(null);
  };

  return {
    suggestions,
    usageInfo,
    jobStatus: jobStatus.data,
    isLoading: isLoading || mutation.isPending || (jobStatus.isLoading && !!jobId),
    error: error || mutation.error || jobStatus.error,
    progress: jobStatus.data?.progress || 0,
    isJobComplete: jobStatus.data?.status === 'complete',
    isJobFailed: jobStatus.data?.status === 'failed',
    generateSuggestions,
    addToToday,
    addForLater,
    dismissSuggestion,
    clearSuggestions,
  };
}; 