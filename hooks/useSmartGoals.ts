import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSmartGoals, 
  createSmartGoal, 
  createMultipleSmartGoals,
  updateSmartGoal, 
  deleteSmartGoal,
  type SmartGoal, 
  type CreateSmartGoalParams,
  type UpdateSmartGoalParams
} from '@/api/smartGoals';

export const useSmartGoals = () => {
  return useQuery({
    queryKey: ['smartGoals'],
    queryFn: getSmartGoals,
  });
};

export const useCreateSmartGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSmartGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
    },
  });
};

export const useCreateMultipleSmartGoals = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMultipleSmartGoals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
    },
  });
};

export const useUpdateSmartGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSmartGoalParams }) => 
      updateSmartGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
    },
  });
};

export const useDeleteSmartGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSmartGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartGoals'] });
    },
  });
}; 