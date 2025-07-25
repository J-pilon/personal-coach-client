import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, AiRequestParams, AiResponse, SmartGoalResponse, PrioritizationResponse } from '@/api/ai';

// Hook for processing AI requests
export const useProcessAiRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: AiRequestParams) => {
      const response = await aiApi.processAiRequest(params);
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    },
    onSuccess: (data: AiResponse) => {
      // Invalidate relevant queries based on the intent
      if (data.intent === 'smart_goal') {
        queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
      } else if (data.intent === 'prioritization') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    },
  });
};

// Hook for creating smart goals via AI
export const useCreateSmartGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: string) => {
      const response = await aiApi.createSmartGoal(input);
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    },
    onSuccess: (data: AiResponse) => {
      // Invalidate smart goals queries
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
    },
  });
};

// Hook for prioritizing tasks via AI
export const usePrioritizeTasks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: string) => {
      const response = await aiApi.prioritizeTasks(input);
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    },
    onSuccess: (data: AiResponse) => {
      // Invalidate tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Hook for processing any AI request with custom success handling
export const useAiRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: AiRequestParams) => {
      const response = await aiApi.processAiRequest(params);
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    },
    onSuccess: (data: AiResponse) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Utility hook for checking response types
export const useAiResponseHelpers = () => {
  return {
    isSmartGoalResponse: aiApi.isSmartGoalResponse,
    isPrioritizationResponse: aiApi.isPrioritizationResponse,
    isErrorResponse: aiApi.isErrorResponse,
    formatMultiPeriodSmartGoalResponse: aiApi.formatMultiPeriodSmartGoalResponse,
    formatSingleSmartGoal: aiApi.formatSingleGoal,
    formatPrioritizationResponse: aiApi.formatPrioritizationResponse,
  };
};

// Hook for getting AI request history (if needed in the future)
export const useAiRequestHistory = () => {
  // This could be implemented when we add an endpoint to fetch AI request history
  // For now, it's a placeholder
  return {
    data: null,
    isLoading: false,
    error: null,
  };
};

// Hook for getting AI request by ID (if needed in the future)
export const useAiRequestById = (requestId: number) => {
  // This could be implemented when we add an endpoint to fetch specific AI requests
  // For now, it's a placeholder
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}; 