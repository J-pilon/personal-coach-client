import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';
import SmartGoalsScreen from '../../app/smartGoals';

// Mock the hooks
jest.mock('../../hooks/useSmartGoals', () => ({
  useSmartGoals: jest.fn(),
}));

jest.mock('../../hooks/useUser', () => ({
  useProfile: jest.fn(),
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

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

// Mock AiOnboardingWizard component
jest.mock('../../components/AiOnboardingWizard', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return function MockAiOnboardingWizard({ onComplete }: { onComplete: () => void }) {
    return (
      <Pressable onPress={onComplete} testID="onboarding-wizard">
        <Text>Complete Onboarding</Text>
      </Pressable>
    );
  };
});

const mockUseSmartGoals = require('../../hooks/useSmartGoals').useSmartGoals;
const mockUseProfile = require('../../hooks/useUser').useProfile;

describe('SmartGoalsScreen', () => {
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

  it('renders loading state when profile is loading', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    mockUseSmartGoals.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('smart-goals-loading-text')).toBeTruthy();
  });

  it('renders onboarding prompt when onboarding is incomplete', () => {
    const mockProfile = {
      id: 1,
      onboarding_status: 'incomplete',
    };

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseSmartGoals.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('smart-goals-create-title')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-start-text')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-feature-timeframes')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-feature-framework')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-feature-progress')).toBeTruthy();
  });

  it('shows onboarding wizard when start button is pressed', () => {
    const mockProfile = {
      id: 1,
      onboarding_status: 'incomplete',
    };

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseSmartGoals.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    const startButton = screen.getByTestId('smart-goals-start-button');
    fireEvent.press(startButton);

    // Instead of getByTestId, check for the wizard's button
    expect(screen.getByText('Complete Onboarding')).toBeTruthy();
  });

  it('renders loading state when goals are loading and onboarding is complete', () => {
    const mockProfile = {
      id: 1,
      onboarding_status: 'complete',
    };

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseSmartGoals.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('smart-goals-loading-goals-text')).toBeTruthy();
  });

  it('renders error state when goals fail to load', () => {
    const mockProfile = {
      id: 1,
      onboarding_status: 'complete',
    };

    const error = new Error('Failed to load goals');

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseSmartGoals.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('smart-goals-error-title')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-error-message')).toBeTruthy();
  });

  it('renders goals correctly when onboarding is complete', () => {
    const mockProfile = {
      id: 1,
      onboarding_status: 'complete',
    };

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

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseSmartGoals.mockReturnValue({
      data: mockGoals,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('smart-goals-title')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-subtitle')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-timeframe-3_months')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-timeframe-6_months')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-goal-title-1')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-goal-title-2')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-add-text')).toBeTruthy();
  });

  it('renders empty state for timeframe with no goals', () => {
    const mockProfile = {
      id: 1,
      onboarding_status: 'complete',
    };

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
    ];

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseSmartGoals.mockReturnValue({
      data: mockGoals,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('smart-goals-empty-1_month')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-empty-6_months')).toBeTruthy();
  });

  it('handles add new goal button press', () => {
    const mockProfile = {
      id: 1,
      onboarding_status: 'complete',
    };

    const mockGoals: any[] = [];

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseSmartGoals.mockReturnValue({
      data: mockGoals,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    const addButton = screen.getByTestId('smart-goals-add-button');
    fireEvent.press(addButton);

    expect(Alert.alert).toHaveBeenCalledWith('Add Goal', 'Add goal functionality coming soon!');
  });

  it('handles onboarding wizard completion', () => {
    const mockProfile = {
      id: 1,
      onboarding_status: 'incomplete',
    };

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    mockUseSmartGoals.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    // Start onboarding
    const startButton = screen.getByTestId('smart-goals-start-button');
    fireEvent.press(startButton);

    // Complete onboarding (use click for the mock)
    const completeButton = screen.getByText('Complete Onboarding');
    fireEvent.press(completeButton);

    // Should return to the main screen
    expect(screen.getByTestId('smart-goals-create-title')).toBeTruthy();
  });
}); 