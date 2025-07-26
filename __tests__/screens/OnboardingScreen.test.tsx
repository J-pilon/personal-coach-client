import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OnboardingScreen from '../../app/onboarding';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

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

// Mock useColorScheme hook
jest.mock('../../hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

describe('OnboardingScreen', () => {
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

  it('renders welcome screen correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    // Check if main content is displayed
    expect(screen.getByTestId('onboarding-welcome-title')).toBeTruthy();
    expect(screen.getByTestId('onboarding-welcome-subtitle')).toBeTruthy();

    // Check if features are displayed
    expect(screen.getByTestId('onboarding-feature-clear-goals')).toBeTruthy();
    expect(screen.getByTestId('onboarding-feature-track-progress')).toBeTruthy();
    expect(screen.getByTestId('onboarding-feature-breakdown')).toBeTruthy();
    expect(screen.getByTestId('onboarding-feature-ai')).toBeTruthy();

    // Check if SMART goals info is displayed
    expect(screen.getByTestId('onboarding-smart-title')).toBeTruthy();
    expect(screen.getByTestId('onboarding-smart-description')).toBeTruthy();

    // Check if start button is present
    expect(screen.getByTestId('primary-button')).toBeTruthy();
    expect(screen.getByTestId('primary-button-text')).toBeTruthy();
  });

  it('shows onboarding wizard when start button is pressed', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    const startButton = screen.getByTestId('primary-button');
    fireEvent.press(startButton);

    expect(screen.getByText('Complete Onboarding')).toBeTruthy();
  });

  it('handles onboarding wizard completion', () => {
    const mockRouter = require('expo-router').router;

    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    // Start onboarding
    const startButton = screen.getByTestId('primary-button');
    fireEvent.press(startButton);

    // Complete onboarding
    const completeButton = screen.getByText('Complete Onboarding');
    fireEvent.press(completeButton);

    // Should navigate to main app
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('renders all feature items correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    // Check all feature items are present
    expect(screen.getByTestId('onboarding-feature-ai')).toBeTruthy();
    expect(screen.getByTestId('onboarding-feature-clear-goals')).toBeTruthy();
    expect(screen.getByTestId('onboarding-feature-track-progress')).toBeTruthy();
    expect(screen.getByTestId('onboarding-feature-breakdown')).toBeTruthy();
  });

  it('renders SMART goals explanation correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('onboarding-smart-title')).toBeTruthy();
    expect(screen.getByTestId('onboarding-smart-description')).toBeTruthy();
  });

  it('has proper button styling and content', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    const startButton = screen.getByTestId('primary-button');
    expect(startButton).toBeTruthy();

    // Check if the button contains the expected text and icon
    expect(screen.getByTestId('primary-button-text')).toBeTruthy();
  });

  it('maintains state correctly when toggling between screens', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    // Initially should show welcome screen
    expect(screen.getByTestId('onboarding-welcome-title')).toBeTruthy();
    expect(screen.queryByText('Complete Onboarding')).toBeNull();

    // Start onboarding
    const startButton = screen.getByTestId('primary-button');
    fireEvent.press(startButton);

    // Should show wizard
    expect(screen.getByText('Complete Onboarding')).toBeTruthy();
    expect(screen.queryByTestId('onboarding-welcome-title')).toBeNull();

    // Complete onboarding
    const completeButton = screen.getByText('Complete Onboarding');
    fireEvent.press(completeButton);

    // Should return to welcome screen (before navigation)
    expect(screen.getByTestId('onboarding-welcome-title')).toBeTruthy();
    expect(screen.queryByText('Complete Onboarding')).toBeNull();
  });
}); 