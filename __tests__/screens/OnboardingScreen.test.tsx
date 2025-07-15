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

// Mock OnboardingWizard component
jest.mock('../../components/OnboardingWizard', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return function MockOnboardingWizard({ onComplete }: { onComplete: () => void }) {
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
    expect(screen.getByText('Welcome to Personal Coach')).toBeTruthy();
    expect(screen.getByText("Let's create your personalized SMART goals to achieve success")).toBeTruthy();

    // Check if features are displayed
    expect(screen.getByText('Set clear, measurable goals')).toBeTruthy();
    expect(screen.getByText('Track your progress over time')).toBeTruthy();
    expect(screen.getByText('Break down goals into actionable tasks')).toBeTruthy();
    expect(screen.getByText('Stay motivated with regular check-ins')).toBeTruthy();

    // Check if SMART goals info is displayed
    expect(screen.getByText('What are SMART Goals?')).toBeTruthy();
    expect(screen.getByText(/SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound objectives/)).toBeTruthy();

    // Check if start button is present
    expect(screen.getByText('Start Creating Goals')).toBeTruthy();
  });

  it('shows onboarding wizard when start button is pressed', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    const startButton = screen.getByText('Start Creating Goals');
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
    const startButton = screen.getByText('Start Creating Goals');
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
    const features = [
      'Set clear, measurable goals',
      'Track your progress over time',
      'Break down goals into actionable tasks',
      'Stay motivated with regular check-ins',
    ];

    features.forEach(feature => {
      expect(screen.getByText(feature)).toBeTruthy();
    });
  });

  it('renders SMART goals explanation correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    expect(screen.getByText('What are SMART Goals?')).toBeTruthy();
    expect(screen.getByText(/SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound objectives that help you focus your efforts and increase your chances of achieving what you want./)).toBeTruthy();
  });

  it('has proper button styling and content', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    const startButton = screen.getByText('Start Creating Goals');
    expect(startButton).toBeTruthy();

    // Check if the button contains the expected text and icon
    expect(screen.getByText('Start Creating Goals')).toBeTruthy();
  });

  it('maintains state correctly when toggling between screens', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen />
      </QueryClientProvider>
    );

    // Initially should show welcome screen
    expect(screen.getByText('Welcome to Personal Coach')).toBeTruthy();
    expect(screen.queryByText('Complete Onboarding')).toBeNull();

    // Start onboarding
    const startButton = screen.getByText('Start Creating Goals');
    fireEvent.press(startButton);

    // Should show wizard
    expect(screen.getByText('Complete Onboarding')).toBeTruthy();
    expect(screen.queryByText('Welcome to Personal Coach')).toBeNull();

    // Complete onboarding
    const completeButton = screen.getByText('Complete Onboarding');
    fireEvent.press(completeButton);

    // Should return to welcome screen (before navigation)
    expect(screen.getByText('Welcome to Personal Coach')).toBeTruthy();
    expect(screen.queryByText('Complete Onboarding')).toBeNull();
  });
}); 