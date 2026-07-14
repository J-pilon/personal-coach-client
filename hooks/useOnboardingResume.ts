import { OnboardingAPI, type SuggestHabitsParams } from '@/api/onboarding';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';

const onboardingApi = new OnboardingAPI();

export const useOnboardingResume = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['onboarding', 'resume'],
    queryFn: async () => {
      const response = await onboardingApi.resume();
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!token,
    staleTime: 0,
  });
};

export const useStartDiscoverySession = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await onboardingApi.startDiscovery();
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
};

export const useSendDiscoveryMessage = () => {
  return useMutation({
    mutationFn: async ({
      session_id,
      text,
    }: {
      session_id: number;
      text: string;
    }) => {
      const response = await onboardingApi.postDiscoveryMessage(session_id, text);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
};

export const useSuggestHabits = () => {
  return useMutation({
    mutationFn: async (params: SuggestHabitsParams) => {
      const response = await onboardingApi.suggestHabits(params);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
};
