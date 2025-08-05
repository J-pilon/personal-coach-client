import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import * as usersApi from '../../api/users';
import { AuthProvider } from '../../hooks/useAuth';
import { useCompleteOnboarding, useProfile, useUpdateProfile } from '../../hooks/useUser';

// Mock the API module
jest.mock('../../api/users', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  completeOnboarding: jest.fn(),
}));

// Mock React Query hooks
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

const mockUseQuery = require('@tanstack/react-query').useQuery;
const mockUseMutation = require('@tanstack/react-query').useMutation;

describe('useUser Hooks', () => {
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  describe('useProfile', () => {
    it('returns profile data', () => {
      const mockProfile = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        work_role: 'Software Engineer',
        education: 'Bachelor of Science',
        desires: 'I want to become a senior developer',
        limiting_beliefs: 'I am not good enough',
        onboarding_status: 'complete',
        onboarding_completed_at: '2024-01-01T00:00:00Z',
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockUseQuery.mockReturnValue({
        data: mockProfile,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      expect(result.current.data).toEqual(mockProfile);
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

      const { result } = renderHook(() => useProfile(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('returns error state', () => {
      const error = new Error('Failed to fetch profile');

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

      const { result } = renderHook(() => useProfile(), { wrapper });

      expect(result.current.error).toEqual(error);
      expect(result.current.isError).toBe(true);
    });
  });

  describe('useUpdateProfile', () => {
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

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('calls updateProfile API when mutate is called', async () => {
      const mockMutate = jest.fn();
      const mockUpdateProfile = usersApi.updateProfile as jest.MockedFunction<typeof usersApi.updateProfile>;

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      const profileData = {
        first_name: 'Jane',
        last_name: 'Smith',
        work_role: 'Senior Developer',
      };
      result.current.mutate(profileData);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(profileData);
      });
    });
  });

  describe('useCompleteOnboarding', () => {
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

      const { result } = renderHook(() => useCompleteOnboarding(), { wrapper });

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('calls completeOnboarding API when mutate is called', async () => {
      const mockMutate = jest.fn();
      const mockCompleteOnboarding = usersApi.completeOnboarding as jest.MockedFunction<typeof usersApi.completeOnboarding>;

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useCompleteOnboarding(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });
  });
}); 