import {
  SmartGoalsAPI,
  type CreateSmartGoalParams,
  type UpdateSmartGoalParams
} from '@/api/smartGoals';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Create a singleton instance of SmartGoalsAPI
const smartGoalsApi = new SmartGoalsAPI();

export const useSmartGoals = () => {
  return useQuery({
    queryKey: ['smartGoals'],
    queryFn: async () => {
      const response = await smartGoalsApi.getAllSmartGoals();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
  });
};

export const useCreateSmartGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSmartGoalParams) => {
      const response = await smartGoalsApi.createSmartGoal(data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
    },
  });
};

export const useCreateMultipleSmartGoals = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goals: CreateSmartGoalParams[]) => {
      const response = await smartGoalsApi.createMultipleSmartGoals(goals);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
    },
  });
};

export const useUpdateSmartGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSmartGoalParams }) => {
      const response = await smartGoalsApi.updateSmartGoal(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
    },
  });
};

export const useDeleteSmartGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await smartGoalsApi.deleteSmartGoal(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
    },
  });
}; 