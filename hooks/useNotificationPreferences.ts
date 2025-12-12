import {
  notificationPreferencesAPI,
  type NotificationPreference,
  type UpdateNotificationPreferenceData,
} from '@/api/notificationPreferences';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = ['notificationPreferences'];

export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<NotificationPreference | null> => {
      const response = await notificationPreferencesAPI.get();

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data?.notification_preference ?? null;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateNotificationPreferenceData) => {
      const response = await notificationPreferencesAPI.update(data);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data?.notification_preference;
    },
    onSuccess: (updatedPreference) => {
      queryClient.setQueryData(QUERY_KEY, updatedPreference);
    },
  });

  return {
    preferences,
    isLoading,
    error: error?.message || updateMutation.error?.message,
    isUpdating: updateMutation.isPending,
    updatePreferences: updateMutation.mutateAsync,
    refetch,
  };
};

