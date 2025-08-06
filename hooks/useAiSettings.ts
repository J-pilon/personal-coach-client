import { apiPost } from '@/utils/apiRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'openai_api_key';

// Core interfaces
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

// API key management utilities
const getStoredApiKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting stored API key:', error);
    return null;
  }
};

const setStoredApiKey = async (key: string): Promise<void> => {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
};

const clearStoredApiKey = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
};

// Main AI settings hook
export const useAiSettings = () => {
  // Query for usage info with API key
  const {
    data: usageInfo,
    isLoading: isLoadingUsage,
    error: usageError,
    refetch: refetchUsage
  } = useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      const userKey = await getStoredApiKey();
      
      // Convert null to undefined for query params
      const params = userKey ? { user_provided_key: userKey } : undefined;
      
      const response = await apiPost<{ usage_info: UsageInfo }>('/ai/usage', params);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data?.usage_info;
    },
  });

  // Mutation for setting API key
  const setApiKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      await setStoredApiKey(key);
      return key;
    },
    onSuccess: () => {
      refetchUsage();
    },
  });

  // Mutation for clearing API key
  const clearApiKeyMutation = useMutation({
    mutationFn: async () => {
      await clearStoredApiKey();
    },
    onSuccess: () => {
      refetchUsage();
    },
  });

  return {
    // API key management
    setApiKey: setApiKeyMutation.mutateAsync,
    clearApiKey: clearApiKeyMutation.mutateAsync,
    getStoredApiKey,
    
    // Usage info
    usageInfo,
    isLoading: isLoadingUsage || setApiKeyMutation.isPending || clearApiKeyMutation.isPending,
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
      const userApiKey = await getStoredApiKey();
      
      const response = await apiPost<AiProxyResponse>('/ai/proxy', {
        input,
        user_provided_key: userApiKey || null,
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
      
      // Update usage info in cache
      queryClient.setQueryData(['ai-usage'], data.usage_info);
    },
  });
}; 