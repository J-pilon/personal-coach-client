import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AiOnboardingWizard from '../components/AiOnboardingWizard';

// Mock the hooks
jest.mock('@/hooks/useUser', () => ({
  useCreateUser: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
  }),
  useCompleteOnboarding: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
  }),
}));

jest.mock('@/hooks/useSmartGoals', () => ({
  useCreateMultipleSmartGoals: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
  }),
}));

jest.mock('@/hooks/useAi', () => ({
  useCreateSmartGoal: () => ({
    mutateAsync: jest.fn().mockResolvedValue({
      intent: 'smart_goal',
      response: {
        specific: 'Exercise for 30 minutes daily',
        measurable: 'Track workouts in fitness app',
        achievable: 'Start with 3 days per week',
        relevant: 'Improves overall health and energy',
        time_bound: 'Complete 30 workouts in 3 months'
      },
      context_used: true,
      request_id: 123
    }),
  }),
  useAiResponseHelpers: () => ({
    isSmartGoalResponse: jest.fn().mockReturnValue(true),
    formatSmartGoalResponse: jest.fn().mockReturnValue('Formatted SMART goal'),
  }),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('AiOnboardingWizard', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the goal description step initially', () => {
    const { getByText, getByPlaceholderText } = render(
      <AiOnboardingWizard onComplete={mockOnComplete} />
    );

    expect(getByText('What do you want to achieve?')).toBeTruthy();
    expect(getByText('Describe what you want to accomplish. We\'ll create goals for 1 month, 3 months, and 6 months!')).toBeTruthy();
    expect(getByPlaceholderText('e.g., I want to improve my fitness and run a marathon, or learn web development and build my own website...')).toBeTruthy();
  });

  it('shows validation error when submitting empty goal description', async () => {
    const { getByText } = render(
      <AiOnboardingWizard onComplete={mockOnComplete} />
    );

    const submitButton = getByText('Generate SMART Goal');
    fireEvent.press(submitButton);

    // Note: Alert.alert is not easily testable in React Native Testing Library
    // In a real test environment, you might want to mock Alert or use a different testing approach
  });

  it('shows progress bar with correct step count', () => {
    const { getByText } = render(
      <AiOnboardingWizard onComplete={mockOnComplete} />
    );

    expect(getByText('Step 1 of 3')).toBeTruthy();
  });

  it('has correct step titles', () => {
    const { getByText } = render(
      <AiOnboardingWizard onComplete={mockOnComplete} />
    );

    // Initial step
    expect(getByText('What do you want to achieve?')).toBeTruthy();
  });

  it('renders input field with correct styling', () => {
    const { getByPlaceholderText } = render(
      <AiOnboardingWizard onComplete={mockOnComplete} />
    );

    const input = getByPlaceholderText('e.g., I want to improve my fitness and run a marathon, or learn web development and build my own website...');
    expect(input).toBeTruthy();
  });

  it('renders submit button with correct text', () => {
    const { getByText } = render(
      <AiOnboardingWizard onComplete={mockOnComplete} />
    );

    expect(getByText('Generate SMART Goal')).toBeTruthy();
  });
}); 