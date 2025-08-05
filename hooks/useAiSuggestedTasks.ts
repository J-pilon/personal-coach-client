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

export const useAiSuggestedTasks = (profileId: number) => {
  const [suggestions, setSuggestions] = useState<AiTaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => apiPost<AiTaskSuggestion[]>('/ai/suggested_tasks', { profile_id: profileId }),
    onSuccess: (response: ApiResponse<AiTaskSuggestion[]>) => {
      if (response.error) {
        setError(response.error);
      } else {
        setSuggestions(response.data || []);
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
    setError(null);
  };

  return {
    suggestions,
    isLoading: isLoading || mutation.isPending,
    error,
    generateSuggestions,
    addToToday,
    addForLater,
    dismissSuggestion,
    clearSuggestions,
  };
}; 