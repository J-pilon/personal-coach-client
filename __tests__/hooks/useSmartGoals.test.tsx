import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useCreateMultipleSmartGoals, useCreateSmartGoal, useDeleteSmartGoal, useSmartGoals, useUpdateSmartGoal } from '../../hooks/useSmartGoals';

// Mock the API module
jest.mock('../../api/smartGoals', () => ({
  SmartGoalsAPI: jest.fn().mockImplementation(() => ({
    getAllSmartGoals: jest.fn(),
    getSmartGoal: jest.fn(),
    createSmartGoal: jest.fn(),
    createMultipleSmartGoals: jest.fn(),
    updateSmartGoal: jest.fn(),
    deleteSmartGoal: jest.fn(),
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

describe('useSmartGoals Hooks', () => {
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

  describe('useSmartGoals', () => {
    it('returns smart goals data', () => {
      const mockGoals = [
        {
          id: 1,
          title: 'Learn React Native',
          description: 'Master React Native development',
          timeframe: '3_months',
          specific: 'Complete 3 React Native projects',
          measurable: 'Build and deploy 3 working mobile applications',
          achievable: 'Dedicate 2 hours daily to learning and practice',
          relevant: 'Enhance mobile development skills for career growth',
          time_bound: 'Complete all projects within 3 months',
          completed: false,
          target_date: '2024-04-01',
          profile_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          title: 'Get Certified',
          description: 'Obtain professional certification',
          timeframe: '6_months',
          specific: 'Pass AWS Solutions Architect exam',
          measurable: 'Achieve passing score on certification exam',
          achievable: 'Study 1 hour daily and take practice exams',
          relevant: 'Advance career in cloud computing',
          time_bound: 'Complete certification within 6 months',
          completed: true,
          target_date: '2024-07-01',
          profile_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockUseQuery.mockReturnValue({
        data: mockGoals,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useSmartGoals(), { wrapper });

      expect(result.current.data).toEqual(mockGoals);
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

      const { result } = renderHook(() => useSmartGoals(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('returns error state', () => {
      const error = new Error('Failed to fetch smart goals');

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

      const { result } = renderHook(() => useSmartGoals(), { wrapper });

      expect(result.current.error).toEqual(error);
      expect(result.current.isError).toBe(true);
    });
  });

  describe('useCreateSmartGoal', () => {
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

      const { result } = renderHook(() => useCreateSmartGoal(), { wrapper });

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('calls createSmartGoal API when mutate is called', async () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useCreateSmartGoal(), { wrapper });

      const goalData = {
        title: 'Learn React Native',
        description: 'Master React Native development',
        timeframe: '3_months' as const,
        specific: 'Complete 3 React Native projects',
        measurable: 'Build and deploy 3 working mobile applications',
        achievable: 'Dedicate 2 hours daily to learning and practice',
        relevant: 'Enhance mobile development skills for career growth',
        time_bound: 'Complete all projects within 3 months',
        completed: false,
        target_date: '2024-04-01',
      };
      result.current.mutate(goalData);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(goalData);
      });
    });
  });

  describe('useCreateMultipleSmartGoals', () => {
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

      const { result } = renderHook(() => useCreateMultipleSmartGoals(), { wrapper });

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('calls createMultipleSmartGoals API when mutate is called', async () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useCreateMultipleSmartGoals(), { wrapper });

      const goalsData = [
        {
          title: 'Learn React Native',
          description: 'Master React Native development',
          timeframe: '3_months' as const,
          specific: 'Complete 3 React Native projects',
          measurable: 'Build and deploy 3 working mobile applications',
          achievable: 'Dedicate 2 hours daily to learning and practice',
          relevant: 'Enhance mobile development skills for career growth',
          time_bound: 'Complete all projects within 3 months',
          completed: false,
          target_date: '2024-04-01',
        },
        {
          title: 'Get Certified',
          description: 'Obtain professional certification',
          timeframe: '6_months' as const,
          specific: 'Pass AWS Solutions Architect exam',
          measurable: 'Achieve passing score on certification exam',
          achievable: 'Study 1 hour daily and take practice exams',
          relevant: 'Advance career in cloud computing',
          time_bound: 'Complete certification within 6 months',
          completed: false,
          target_date: '2024-07-01',
        },
      ];
      result.current.mutate(goalsData);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(goalsData);
      });
    });
  });

  describe('useUpdateSmartGoal', () => {
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

      const { result } = renderHook(() => useUpdateSmartGoal(), { wrapper });

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('calls updateSmartGoal API when mutate is called', async () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useUpdateSmartGoal(), { wrapper });

      const updateData = {
        id: 1,
        data: {
          title: 'Updated Goal Title',
          description: 'Updated description',
          completed: true,
        },
      };
      result.current.mutate(updateData);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(updateData);
      });
    });
  });

  describe('useDeleteSmartGoal', () => {
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

      const { result } = renderHook(() => useDeleteSmartGoal(), { wrapper });

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('calls deleteSmartGoal API when mutate is called', async () => {
      const mockMutate = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useDeleteSmartGoal(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(1);
      });
    });
  });
}); 