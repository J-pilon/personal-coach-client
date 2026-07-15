import { NotificationSchedulesAPI } from '@/api/notificationSchedules';
import type { UpsertNotificationScheduleParams } from '@/models/notificationSchedule';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const notificationSchedulesApi = new NotificationSchedulesAPI();

export const useUpsertNotificationSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpsertNotificationScheduleParams) => {
      const response = await notificationSchedulesApi.upsert(params);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSchedules'] });
    },
  });
};
