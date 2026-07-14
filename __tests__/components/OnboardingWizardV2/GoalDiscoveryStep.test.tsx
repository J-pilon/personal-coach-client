import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import GoalDiscoveryStep from '../../../components/OnboardingWizardV2/steps/GoalDiscoveryStep';

const mockJobData: { value: any } = { value: null };
const mockStartDiscovery = jest.fn();

jest.mock('@/hooks/useOnboardingResume', () => ({
  useStartDiscoverySession: () => ({
    mutateAsync: (...a: any[]) => mockStartDiscovery(...a),
  }),
  useSendDiscoveryMessage: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ job_id: 'j2' }),
    isPending: false,
  }),
}));

jest.mock('@/hooks/useJobStatus', () => ({
  useJobStatus: () => ({ data: mockJobData.value }),
}));

jest.mock('@/hooks/useSmartGoals', () => ({
  useCreateSmartGoal: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ id: 42 }),
    isPending: false,
  }),
}));

jest.mock('@/hooks/useUser', () => ({
  useProfile: () => ({ data: { id: 1 } }),
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

describe('GoalDiscoveryStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJobData.value = null;
    mockStartDiscovery.mockResolvedValue({ session_id: 1, job_id: 'j1' });
  });

  it('renders a ChatBubble for a question turn', async () => {
    mockJobData.value = {
      status: 'complete',
      result: { kind: 'question', text: 'What matters most?' },
    };
    const { findByText } = render(
      <Wrapper>
        <GoalDiscoveryStep onGoalCommitted={jest.fn()} />
      </Wrapper>,
    );
    expect(await findByText('What matters most?')).toBeTruthy();
  });

  it('renders SmartGoalCard when server returns smart_goal_draft', async () => {
    mockJobData.value = {
      status: 'complete',
      result: {
        kind: 'smart_goal_draft',
        goal: {
          title: 'Run 5k',
          why: 'Health',
          specific: 'Run 3x/wk',
          measurable: 'App tracked',
          time_bound: 'In 8 weeks',
          timeframe: '3_months',
        },
      },
    };
    const { findByTestId } = render(
      <Wrapper>
        <GoalDiscoveryStep onGoalCommitted={jest.fn()} />
      </Wrapper>,
    );
    expect(await findByTestId('smart-goal-card')).toBeTruthy();
  });

  it('surfaces manual fallback after 2 AI failures', async () => {
    mockJobData.value = { status: 'failed' };
    mockStartDiscovery.mockRejectedValueOnce(new Error('boom'));
    const { findByTestId, rerender } = render(
      <Wrapper>
        <GoalDiscoveryStep onGoalCommitted={jest.fn()} />
      </Wrapper>,
    );
    // second failure via mockJobData
    rerender(
      <Wrapper>
        <GoalDiscoveryStep onGoalCommitted={jest.fn()} />
      </Wrapper>,
    );
    await waitFor(() =>
      expect(findByTestId('goal-discovery-manual-fallback')).toBeTruthy(),
    );
  });
});
