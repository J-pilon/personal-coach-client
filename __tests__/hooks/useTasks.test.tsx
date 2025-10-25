import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useCreateTask, useDeleteTask, useTask, useTasks, useUpdateTask } from '../../hooks/useTasks';

// Mock the API module
jest.mock('../../api/tasks', () => ({
  TasksAPI: jest.fn().mockImplementation(() => ({
    getAllTasks: jest.fn(),
    getTask: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    toggleTaskCompletion: jest.fn(),
  })),
}));

// Mock React Query hooks
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

const mockUseQuery = require('@tanstack/react-query').useQuery;
const mockUseMutation = require('@tanstack/react-query').useMutation;

describe('useTasks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useTasks', () => {
    it('returns tasks data', () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', description: 'Description 1', completed: false, created_at: '2024-01-01T00:00:00Z' },
        { id: 2, title: 'Task 2', description: 'Description 2', completed: true, created_at: '2024-01-02T00:00:00Z' },
      ];

      mockUseQuery.mockReturnValue({
        data: mockTasks,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useTasks(), { wrapper });

      expect(result.current.data).toEqual(mockTasks);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('returns loading state', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useTasks(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('returns error state', () => {
      const error = new Error('Failed to fetch tasks');

      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
        isError: true,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useTasks(), { wrapper });

      expect(result.current.error).toEqual(error);
      expect(result.current.isError).toBe(true);
    });
  });

  describe('useCreateTask', () => {
    it('returns mutation object', () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useCreateTask(), { wrapper });

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('calls createTask API when mutate is called', async () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useCreateTask(), { wrapper });

      const taskData = { title: 'New Task', description: 'New Description', action_category: 'do' as const };
      result.current.mutate(taskData);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(taskData);
      });
    });
  });

  describe('useUpdateTask', () => {
    it('returns mutation object', () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useUpdateTask(), { wrapper });

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('calls updateTask API when mutate is called', async () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useUpdateTask(), { wrapper });

      const updateData = { id: 1, taskData: { title: 'Updated Task', description: 'Updated Description' } };
      result.current.mutate(updateData);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(updateData);
      });
    });
  });

  describe('useDeleteTask', () => {
    it('returns mutation object', () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDeleteTask(), { wrapper });

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('calls deleteTask API when mutate is called', async () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDeleteTask(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('useTask', () => {
    it('returns single task data', () => {
      const mockTask = {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        completed: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockUseQuery.mockReturnValue({
        data: mockTask,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useTask(1), { wrapper });

      expect(result.current.data).toEqual(mockTask);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('returns loading state for single task', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useTask(1), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('returns error state for single task', () => {
      const error = new Error('Failed to fetch task');

      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
        isError: true,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useTask(1), { wrapper });

      expect(result.current.error).toEqual(error);
      expect(result.current.isError).toBe(true);
    });
  });
}); 