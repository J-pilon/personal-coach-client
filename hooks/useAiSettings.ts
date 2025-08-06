import { apiGet, apiPost } from '@/utils/apiRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'openai_api_key';

export interface UsageInfo {
  using_own_key: boolean;
  remaining: number;
  total_limit?: number;
  reset_time?: string;
}

export interface AiProxyResponse {
  intent: 'smart_goal' | 'prioritization' | 'error';
  response: any;
  context_used: boolean;
  request_id: number;
  usage_info: UsageInfo;
}

export const useAiSettings = () => {
  const {
    data: usageInfo,
    isLoading,
    error: usageError,
    refetch: refetchUsage
  } = useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      const response = await apiGet<{ usage_info: UsageInfo }>('/ai/usage');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.usage_info;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for setting API key
  const setApiKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
      return key;
    },
    onSuccess: () => {
      // Refetch usage info after setting key
      refetchUsage();
    },
  });

  // Mutation for clearing API key
  const clearApiKeyMutation = useMutation({
    mutationFn: async () => {
      await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
    },
    onSuccess: () => {
      // Refetch usage info after clearing key
      refetchUsage();
    },
  });

  // Get stored API key
  const getStoredApiKey = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting stored API key:', error);
      return null;
    }
  };

  // Set API key
  const setApiKey = async (key: string): Promise<void> => {
    await setApiKeyMutation.mutateAsync(key);
  };

  // Clear API key
  const clearApiKey = async (): Promise<void> => {
    await clearApiKeyMutation.mutateAsync();
  };

  // Get current API key (synchronous for UI)
  const apiKey = setApiKeyMutation.data || null;

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    getStoredApiKey,
    usageInfo,
    isLoading: isLoading || setApiKeyMutation.isPending || clearApiKeyMutation.isPending,
    error: usageError?.message || setApiKeyMutation.error?.message || clearApiKeyMutation.error?.message,
    refetchUsage,
  };
};

// Hook for making AI requests with the proxy endpoint
export const useAiProxy = () => {
  const { getStoredApiKey } = useAiSettings();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: string) => {
      const userKey = await getStoredApiKey();
      
      const response = await apiPost<AiProxyResponse>('/ai/proxy', {
        input,
        user_provided_key: userKey || null,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    },
    onSuccess: (data: AiProxyResponse) => {
      // Invalidate relevant queries based on the intent
      if (data.intent === 'smart_goal') {
        queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
      } else if (data.intent === 'prioritization') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      
      // Refetch usage info after successful request
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] });
    },
  });
}; 