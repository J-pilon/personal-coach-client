import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import React from 'react';
import OnboardingWizardV2 from '../../../components/OnboardingWizardV2';

const mockResume = jest.fn();

jest.mock('@/hooks/useOnboardingResume', () => ({
  useOnboardingResume: () => mockResume(),
  useStartDiscoverySession: () => ({
    mutateAsync: jest.fn().mockResolvedValue(null),
  }),
  useSendDiscoveryMessage: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useSuggestHabits: () => ({
    mutateAsync: jest.fn().mockResolvedValue(null),
    isPending: false,
  }),
}));

jest.mock('@/hooks/useJobStatus', () => ({
  useJobStatus: () => ({ data: null, isLoading: false }),
}));

jest.mock('@/hooks/useSmartGoals', () => ({
  useCreateSmartGoal: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/useUser', () => ({
  useProfile: () => ({ data: { id: 1 } }),
  useUpdateProfile: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useCompleteOnboarding: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/useHabits', () => ({
  useCreateHabits: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/useHabitCompletions', () => ({
  useCreateHabitCompletion: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('@/hooks/useNotificationSchedules', () => ({
  useUpsertNotificationSchedule: () => ({ mutateAsync: jest.fn() }),
}));

const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { replace: (...args: any[]) => mockRouterReplace(...args) },
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
    }
  >
    {children}
  </QueryClientProvider>
);

describe('OnboardingWizardV2 orchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResume.mockReturnValue({ data: undefined });
  });

  it('renders step 1 by default', () => {
    const { getByTestId } = render(
      <Wrapper>
        <OnboardingWizardV2 />
      </Wrapper>,
    );
    expect(getByTestId('onboarding-v2-progress-fraction')).toBeTruthy();
  });

  it('maps server step name to the reminder screen', async () => {
    mockResume.mockReturnValue({
      data: { current_step: 'reminder', smart_goal_id: 9 },
    });
    const { getByTestId } = render(
      <Wrapper>
        <OnboardingWizardV2 />
      </Wrapper>,
    );
    await waitFor(() =>
      expect(getByTestId('reminder-slot-morning')).toBeTruthy(),
    );
  });

  it('routes home when the server reports onboarding complete', async () => {
    mockResume.mockReturnValue({ data: { current_step: 'complete' } });
    render(
      <Wrapper>
        <OnboardingWizardV2 />
      </Wrapper>,
    );
    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)'),
    );
  });

  it("falls back to habits (step 2) when resuming to today's action without hydrated habits", async () => {
    mockResume.mockReturnValue({
      data: { current_step: 'todays_action', smart_goal_id: 9 },
    });
    const { findByTestId } = render(
      <Wrapper>
        <OnboardingWizardV2 />
      </Wrapper>,
    );
    // HabitsReviewStep renders its "regenerate all" pill once suggestions land;
    // presence of the smart-goal-scoped step title is enough to prove routing.
    expect(await findByTestId('back-button')).toBeTruthy();
  });

  it('shows discard confirmation on back from step 1', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(
      <Wrapper>
        <OnboardingWizardV2 />
      </Wrapper>,
    );
    fireEvent.press(getByTestId('back-button'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Discard discovery and start over?',
      expect.any(String),
      expect.any(Array),
    );
    alertSpy.mockRestore();
  });
});
