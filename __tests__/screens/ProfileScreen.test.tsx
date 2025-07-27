import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfileScreen from '../../app/profile';

// Mock the hooks
jest.mock('../../hooks/useUser', () => ({
  useProfile: jest.fn(),
  useUpdateProfile: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

const mockUseProfile = require('../../hooks/useUser').useProfile;
const mockUseUpdateProfile = require('../../hooks/useUser').useUpdateProfile;

describe('ProfileScreen', () => {
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

  it('renders loading state', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    mockUseUpdateProfile.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('profile-loading-text')).toBeTruthy();
  });

  it('renders error state', () => {
    const error = new Error('Failed to load profile');

    mockUseProfile.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    });

    mockUseUpdateProfile.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('profile-error-text')).toBeTruthy();
    expect(screen.getByTestId('profile-error-message')).toBeTruthy();
  });

  it('renders profile data correctly', () => {
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

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseUpdateProfile.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>
    );

    // Check if profile information is displayed
    expect(screen.getByTestId('profile-personal-info-title')).toBeTruthy();
    expect(screen.getByTestId('profile-name')).toBeTruthy();
    expect(screen.getByTestId('profile-work-role')).toBeTruthy();
    expect(screen.getByTestId('profile-education')).toBeTruthy();

    // Check if goals & aspirations are displayed
    expect(screen.getByTestId('profile-goals-title')).toBeTruthy();
    expect(screen.getByTestId('profile-desires')).toBeTruthy();
    expect(screen.getByTestId('profile-limiting-beliefs')).toBeTruthy();

    // Check if onboarding status is displayed
    expect(screen.getByTestId('profile-onboarding-title')).toBeTruthy();
    expect(screen.getByTestId('profile-onboarding-status')).toBeTruthy();
    expect(screen.getByTestId('profile-onboarding-completed')).toBeTruthy();

    // Check if edit button is present
    expect(screen.getByTestId('profile-edit-text')).toBeTruthy();
  });

  it('renders incomplete onboarding status correctly', () => {
    const mockProfile = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      work_role: 'Software Engineer',
      education: 'Bachelor of Science',
      desires: 'I want to become a senior developer',
      limiting_beliefs: 'I am not good enough',
      onboarding_status: 'incomplete',
      onboarding_completed_at: null,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseUpdateProfile.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('profile-onboarding-status')).toBeTruthy();
  });

  it('handles missing profile data gracefully', () => {
    const mockProfile = {
      id: 1,
      first_name: null,
      last_name: null,
      work_role: null,
      education: null,
      desires: null,
      limiting_beliefs: null,
      onboarding_status: 'incomplete',
      onboarding_completed_at: null,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseUpdateProfile.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>
    );

    // Check if "Not specified" is shown for missing data
    expect(screen.getAllByText('Not specified')).toHaveLength(4);
  });

  it('handles edit profile button press', () => {
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

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseUpdateProfile.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>
    );

    // The edit button should be present
    expect(screen.getByTestId('profile-edit-text')).toBeTruthy();
  });
}); 