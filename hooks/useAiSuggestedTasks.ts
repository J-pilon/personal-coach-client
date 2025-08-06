import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { apiPost, type ApiResponse } from '../utils/apiRequest';

// Interface for AI-generated task suggestions
export interface AiTaskSuggestion {
  title: string;
  description: string;
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

export const useAiSuggestedTasks = (profileId: number) => {
  const [suggestions, setSuggestions] = useState<AiTaskSuggestion[]>([]);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => apiPost<SuggestedTasksResponse>('/ai/suggested_tasks', { profile_id: profileId }),
    onSuccess: (response: ApiResponse<SuggestedTasksResponse>) => {
      if (response.error) {
        setError(response.error);
      } else {
        setSuggestions(response.data?.suggestions || []);
        setUsageInfo(response.data?.usage_info || null);
        setError(null);
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
    },
  });

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    await mutation.mutateAsync();
    setIsLoading(false);
  };

  const addToToday = (suggestion: AiTaskSuggestion) => {
    // This will be handled by the parent component
    return suggestion;
  };

  const addForLater = async (suggestion: AiTaskSuggestion) => {
    // This will be handled by the parent component
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
    isLoading: isLoading || mutation.isPending,
    error,
    generateSuggestions,
    addToToday,
    addForLater,
    dismissSuggestion,
    clearSuggestions,
  };
}; 