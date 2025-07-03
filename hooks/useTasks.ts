import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, Task, CreateTaskParams, UpdateTaskParams } from '@/api/tasks';

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await tasksApi.getAllTasks();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
};

export const useTasksByCategory = (category: 'do' | 'defer' | 'delegate') => {
  return useQuery({
    queryKey: ['tasks', 'category', category],
    queryFn: async () => {
      const response = await tasksApi.getTasksByCategory(category);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
};

export const useCompletedTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'completed'],
    queryFn: async () => {
      const response = await tasksApi.getCompletedTasks();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
};

export const useIncompleteTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'incomplete'],
    queryFn: async () => {
      const response = await tasksApi.getIncompleteTasks();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
};

// Mutation hooks
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: CreateTaskParams) => {
      const response = await tasksApi.createTask(taskData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tasks to update the UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, taskData }: { id: number; taskData: UpdateTaskParams }) => {
      const response = await tasksApi.updateTask(id, taskData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tasks to update the UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await tasksApi.deleteTask(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tasks to update the UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useToggleTaskCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await tasksApi.toggleTaskCompletion(id, completed);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tasks to update the UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}; 