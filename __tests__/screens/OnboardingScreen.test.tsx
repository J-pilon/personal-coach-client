import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import OnboardingScreen from '../../app/onboarding';

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

jest.mock('@/components/OnboardingWizardV2', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');

  return function MockOnboardingWizardV2({ onComplete }: any) {
    return (
      <View testID="onboarding-wizard-v2">
        <TouchableOpacity testID="wizard-complete-button" onPress={onComplete}>
          <Text>Complete</Text>
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

  it('mounts the V2 wizard when "Start with AI" is pressed', () => {
    const { getByText, queryByTestId } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Start with AI'));
    expect(queryByTestId('onboarding-wizard-v2')).toBeTruthy();
  });

  it('skips onboarding and navigates to tabs', async () => {
    const { setSkippedOnboarding } = require('@/utils/handleSkipOnboarding');
    const { router } = require('expo-router');
    const { getByTestId } = render(<OnboardingScreen />);
    fireEvent.press(getByTestId('ai-onboarding-skip-button'));
    await waitFor(() => {
      expect(setSkippedOnboarding).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('returns to welcome after wizard completes', () => {
    const { getByText, getByTestId } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Start with AI'));
    fireEvent.press(getByTestId('wizard-complete-button'));
    expect(getByText('Welcome to Personal Coach')).toBeTruthy();
  });

  it('displays correct welcome text', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    expect(getByTestId('onboarding-welcome-title').props.children).toBe(
      'Welcome to Personal Coach',
    );
    expect(getByTestId('onboarding-welcome-subtitle').props.children).toBe(
      "Let's use AI to create your personalized SMART goals to achieve success",
    );
  });

  it('displays all feature items', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    expect(getByTestId('onboarding-feature-ai').props.children).toBe(
      'AI-powered SMART goal creation',
    );
    expect(getByTestId('onboarding-feature-clear-goals').props.children).toBe(
      'Set clear, measurable goals',
    );
    expect(getByTestId('onboarding-feature-track-progress').props.children).toBe(
      'Track your progress over time',
    );
    expect(getByTestId('onboarding-feature-breakdown').props.children).toBe(
      'Break down goals into actionable tasks',
    );
  });

  it('displays SMART goals explanation', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    expect(getByTestId('onboarding-smart-title').props.children).toBe(
      'What are SMART Goals?',
    );
    expect(getByTestId('onboarding-smart-description').props.children).toBe(
      'SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound objectives that help you focus your efforts and increase your chances of achieving what you want.',
    );
  });
});
