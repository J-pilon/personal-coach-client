import { HabitsAPI } from '@/api/habits';
import type { CreateHabitParams } from '@/models/habit';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const habitsApi = new HabitsAPI();

export const useCreateHabits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      smart_goal_id,
      habits,
    }: {
      smart_goal_id: number;
      habits: CreateHabitParams[];
    }) => {
      const response = await habitsApi.createBulk(smart_goal_id, habits);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, { smart_goal_id }) => {
      queryClient.invalidateQueries({ queryKey: ['habits', smart_goal_id] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};
