import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from './useAuth';

// Interface for AI-generated task suggestions
export interface AiTaskSuggestion {
  title: string;
  description: string;
  goal_id: string | null;
  time_estimate_minutes: number;
}

// Interface for the API response
interface AiSuggestedTasksResponse {
  data?: AiTaskSuggestion[];
  error?: string;
  status: number;
}

// API function to fetch AI suggested tasks
const fetchAiSuggestedTasks = async (profileId: number, userId: number): Promise<AiSuggestedTasksResponse> => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/ai/suggested_tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId.toString(),
      },
      body: JSON.stringify({ profile_id: profileId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data?.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
};

export const useAiSuggestedTasks = (profileId: number) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<AiTaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => fetchAiSuggestedTasks(profileId, user?.id || 1),
    onSuccess: (response) => {
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