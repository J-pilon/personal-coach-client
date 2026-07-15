import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import SmartGoalsScreen from '../../app/smartGoals';

// Mock the hooks
jest.mock('../../hooks/useSmartGoals', () => ({
  useSmartGoals: jest.fn(),
}));

jest.mock('../../hooks/useUser', () => ({
  useProfile: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

// Mock AiOnboardingWizard component
jest.mock('../../components/AiOnboardingWizard_v1', () => {
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

// Get the mock router from the jest setup
const mockRouter = require('expo-router').router;
const mockPush = mockRouter.push;

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

    expect(screen.getByTestId('smart-goals-profile-loading-text')).toBeTruthy();
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

    expect(screen.getByTestId('smart-goals-loading')).toBeTruthy();
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

    expect(screen.getByTestId('smart-goals-timeframe-3_months')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-timeframe-6_months')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-goal-title-1')).toBeTruthy();
    expect(screen.getByTestId('smart-goals-goal-title-2')).toBeTruthy();
    expect(screen.getByTestId('primary-button-text')).toBeTruthy();
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

    expect(mockPush).toHaveBeenCalledWith('/addGoal');
  });

  it('shows due badge on goal cards based on target_date', () => {
    const mockProfile = { id: 1, onboarding_status: 'complete' };

    // Pin the system clock so date-diff is deterministic
    jest.useFakeTimers({ now: new Date('2026-05-25T12:00:00') });

    const mockGoals = [
      {
        id: 10,
        title: 'Past Due Goal',
        timeframe: '1_month',
        specific: 'S', measurable: 'M', achievable: 'A', relevant: 'R', time_bound: 'T',
        completed: false,
        target_date: '2026-05-23',
        profile_id: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 11,
        title: 'Due Soon Goal',
        timeframe: '1_month',
        specific: 'S', measurable: 'M', achievable: 'A', relevant: 'R', time_bound: 'T',
        completed: false,
        target_date: '2026-05-30',
        profile_id: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 12,
        title: 'Completed Past-Due Goal',
        timeframe: '1_month',
        specific: 'S', measurable: 'M', achievable: 'A', relevant: 'R', time_bound: 'T',
        completed: true,
        target_date: '2026-05-20',
        profile_id: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    mockUseProfile.mockReturnValue({ data: mockProfile, isLoading: false, error: null });
    mockUseSmartGoals.mockReturnValue({ data: mockGoals, isLoading: false, error: null });

    render(
      <QueryClientProvider client={queryClient}>
        <SmartGoalsScreen />
      </QueryClientProvider>
    );

    // Goal 10: 2 days past due, not completed → danger badge
    expect(screen.getByTestId('smart-goals-due-badge-10')).toBeTruthy();
    expect(screen.getByText('2 days past due')).toBeTruthy();

    // Goal 11: 5 days until due, not completed → warning badge
    expect(screen.getByTestId('smart-goals-due-badge-11')).toBeTruthy();
    expect(screen.getByText('5 days until due')).toBeTruthy();

    // Goal 12: completed + past date → badge hidden (no element for this goal)
    expect(screen.queryByTestId('smart-goals-due-badge-12')).toBeNull();

    jest.useRealTimers();
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