import { HabitCompletionsAPI } from '@/api/habitCompletions';
import type { CreateHabitCompletionParams } from '@/models/habitCompletion';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const habitCompletionsApi = new HabitCompletionsAPI();

export const useCreateHabitCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateHabitCompletionParams) => {
      const response = await habitCompletionsApi.create(params);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, { habit_id }) => {
      queryClient.invalidateQueries({ queryKey: ['habitCompletions', habit_id] });
      queryClient.invalidateQueries({ queryKey: ['habitCompletions'] });
    },
  });
};
