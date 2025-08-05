import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import OnboardingScreen from '../../app/onboarding';

// Mock the hooks and utilities
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/utils/handleSkipOnboarding', () => ({
  setSkippedOnboarding: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock the AiOnboardingWizard component
jest.mock('@/components/AiOnboardingWizard', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');

  return function MockAiOnboardingWizard({ onComplete, onSkip }: any) {
    return (
      <View testID="ai-onboarding-wizard">
        <TouchableOpacity testID="wizard-complete-button" onPress={onComplete}>
          <Text>Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="wizard-skip-button" onPress={onSkip}>
          <Text>Skip</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the welcome screen initially', () => {
    const { getByTestId } = render(<OnboardingScreen />);

    expect(getByTestId('onboarding-welcome-title')).toBeTruthy();
    expect(getByTestId('onboarding-welcome-subtitle')).toBeTruthy();
    expect(getByTestId('onboarding-feature-ai')).toBeTruthy();
    expect(getByTestId('onboarding-feature-clear-goals')).toBeTruthy();
    expect(getByTestId('onboarding-feature-track-progress')).toBeTruthy();
    expect(getByTestId('onboarding-feature-breakdown')).toBeTruthy();
    expect(getByTestId('onboarding-smart-title')).toBeTruthy();
    expect(getByTestId('onboarding-smart-description')).toBeTruthy();
  });

  it('shows "Start with AI" button', () => {
    const { getByText } = render(<OnboardingScreen />);

    expect(getByText('Start with AI')).toBeTruthy();
  });

  it('shows "Skip For Now" button', () => {
    const { getByTestId } = render(<OnboardingScreen />);

    expect(getByTestId('ai-onboarding-skip-button')).toBeTruthy();
  });

  it('navigates to wizard when "Start with AI" is pressed', () => {
    const { getByText, queryByTestId } = render(<OnboardingScreen />);

    const startButton = getByText('Start with AI');
    fireEvent.press(startButton);

    // Should show the wizard
    expect(queryByTestId('ai-onboarding-wizard')).toBeTruthy();
  });

  it('calls setSkippedOnboarding and navigates to tabs when skip is pressed', async () => {
    const { setSkippedOnboarding } = require('@/utils/handleSkipOnboarding');
    const { router } = require('expo-router');

    const { getByTestId } = render(<OnboardingScreen />);

    const skipButton = getByTestId('ai-onboarding-skip-button');
    fireEvent.press(skipButton);

    await waitFor(() => {
      expect(setSkippedOnboarding).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('shows wizard when start button is pressed', () => {
    const { getByText, queryByTestId } = render(<OnboardingScreen />);

    const startButton = getByText('Start with AI');
    fireEvent.press(startButton);

    // The wizard should be rendered
    expect(queryByTestId('ai-onboarding-wizard')).toBeTruthy();
  });

  it('handles wizard completion correctly', () => {
    const { getByText, getByTestId } = render(<OnboardingScreen />);

    // Start the wizard
    const startButton = getByText('Start with AI');
    fireEvent.press(startButton);

    // Complete the wizard
    const completeButton = getByTestId('wizard-complete-button');
    fireEvent.press(completeButton);

    // Should return to welcome screen
    expect(getByText('Welcome to Personal Coach')).toBeTruthy();
  });

  it('handles wizard skip correctly', async () => {
    const { setSkippedOnboarding } = require('@/utils/handleSkipOnboarding');
    const { router } = require('expo-router');

    const { getByText, getByTestId } = render(<OnboardingScreen />);

    // Start the wizard
    const startButton = getByText('Start with AI');
    fireEvent.press(startButton);

    // Skip from wizard
    const wizardSkipButton = getByTestId('wizard-skip-button');
    fireEvent.press(wizardSkipButton);

    await waitFor(() => {
      expect(setSkippedOnboarding).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('displays correct welcome text', () => {
    const { getByTestId } = render(<OnboardingScreen />);

    const title = getByTestId('onboarding-welcome-title');
    const subtitle = getByTestId('onboarding-welcome-subtitle');

    expect(title.props.children).toBe('Welcome to Personal Coach');
    expect(subtitle.props.children).toBe("Let's use AI to create your personalized SMART goals to achieve success");
  });

  it('displays all feature items', () => {
    const { getByTestId } = render(<OnboardingScreen />);

    expect(getByTestId('onboarding-feature-ai').props.children).toBe('AI-powered SMART goal creation');
    expect(getByTestId('onboarding-feature-clear-goals').props.children).toBe('Set clear, measurable goals');
    expect(getByTestId('onboarding-feature-track-progress').props.children).toBe('Track your progress over time');
    expect(getByTestId('onboarding-feature-breakdown').props.children).toBe('Break down goals into actionable tasks');
  });

  it('displays SMART goals explanation', () => {
    const { getByTestId } = render(<OnboardingScreen />);

    const title = getByTestId('onboarding-smart-title');
    const description = getByTestId('onboarding-smart-description');

    expect(title.props.children).toBe('What are SMART Goals?');
    expect(description.props.children).toBe('SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound objectives that help you focus your efforts and increase your chances of achieving what you want.');
  });
}); 