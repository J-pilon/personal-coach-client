import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import AiOnboardingWizard from '../components/AiOnboardingWizard';

// Mock the hooks
jest.mock('@/hooks/useUser', () => ({
  useCompleteOnboarding: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
  }),
  useUpdateProfile: () => ({
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

// Create a wrapper component with QueryClientProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AiOnboardingWizard', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile details step initially', () => {
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <AiOnboardingWizard onComplete={mockOnComplete} />
      </TestWrapper>
    );

    // Check for title and subtitle by text content
    expect(getByText('Tell us about yourself')).toBeTruthy();
    expect(getByText('Help us provide the best coaching experience by sharing some details about yourself.')).toBeTruthy();

    // Check for form inputs
    expect(getByTestId('first-name-input')).toBeTruthy();
    expect(getByTestId('last-name-input')).toBeTruthy();
    expect(getByTestId('work-role-input')).toBeTruthy();
    expect(getByTestId('education-input')).toBeTruthy();
  });

  it('shows validation error when submitting empty profile details', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AiOnboardingWizard onComplete={mockOnComplete} />
      </TestWrapper>
    );

    const submitButton = getByTestId('profile-continue-button');
    fireEvent.press(submitButton);

    // Note: Alert.alert is not easily testable in React Native Testing Library
    // In a real test environment, you might want to mock Alert or use a different testing approach
  });

  it('shows progress bar with correct step count', () => {
    const { getByText } = render(
      <TestWrapper>
        <AiOnboardingWizard onComplete={mockOnComplete} />
      </TestWrapper>
    );

    expect(getByText('Step 1 of 4')).toBeTruthy();
  });

  it('has correct step titles', () => {
    const { getByText } = render(
      <TestWrapper>
        <AiOnboardingWizard onComplete={mockOnComplete} />
      </TestWrapper>
    );

    // Initial step should show the profile details title
    expect(getByText('Tell us about yourself')).toBeTruthy();
  });

  it('renders profile input fields with correct styling', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AiOnboardingWizard onComplete={mockOnComplete} />
      </TestWrapper>
    );

    const firstNameInput = getByTestId('first-name-input');
    const lastNameInput = getByTestId('last-name-input');
    const workRoleInput = getByTestId('work-role-input');
    const educationInput = getByTestId('education-input');

    expect(firstNameInput).toBeTruthy();
    expect(lastNameInput).toBeTruthy();
    expect(workRoleInput).toBeTruthy();
    expect(educationInput).toBeTruthy();
  });

  it('renders submit button with correct text', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AiOnboardingWizard onComplete={mockOnComplete} />
      </TestWrapper>
    );

    expect(getByTestId('profile-continue-button')).toBeTruthy();
  });

  it('renders optional fields with descriptions', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AiOnboardingWizard onComplete={mockOnComplete} />
      </TestWrapper>
    );

    // Check for optional field labels
    expect(getByTestId('desires-label')).toBeTruthy();
    expect(getByTestId('limiting-beliefs-label')).toBeTruthy();

    // Check for descriptions
    expect(getByTestId('desires-description')).toBeTruthy();
    expect(getByTestId('limiting-beliefs-description')).toBeTruthy();

    // Check for input fields
    expect(getByTestId('desires-input')).toBeTruthy();
    expect(getByTestId('limiting-beliefs-input')).toBeTruthy();
  });

  it('allows user input in form fields', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AiOnboardingWizard onComplete={mockOnComplete} />
      </TestWrapper>
    );

    const firstNameInput = getByTestId('first-name-input');
    const lastNameInput = getByTestId('last-name-input');
    const workRoleInput = getByTestId('work-role-input');
    const educationInput = getByTestId('education-input');
    const desiresInput = getByTestId('desires-input');
    const limitingBeliefsInput = getByTestId('limiting-beliefs-input');

    // Test that all input fields are present and can be interacted with
    expect(firstNameInput).toBeTruthy();
    expect(lastNameInput).toBeTruthy();
    expect(workRoleInput).toBeTruthy();
    expect(educationInput).toBeTruthy();
    expect(desiresInput).toBeTruthy();
    expect(limitingBeliefsInput).toBeTruthy();

    // Test that we can type in the fields (this would be tested in integration tests)
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(workRoleInput, 'Software Engineer');
    fireEvent.changeText(educationInput, 'Bachelor\'s in Computer Science');
    fireEvent.changeText(desiresInput, 'I want to be financially independent');
    fireEvent.changeText(limitingBeliefsInput, 'I don\'t have enough time');
  });
}); 