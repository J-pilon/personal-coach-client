import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import HabitsReviewStep from '../../../components/OnboardingWizardV2/steps/HabitsReviewStep';

const mockJobData: { value: any } = { value: null };

jest.mock('@/hooks/useOnboardingResume', () => ({
  useSuggestHabits: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ job_id: 'jh' }),
    isPending: false,
  }),
}));

jest.mock('@/hooks/useJobStatus', () => ({
  useJobStatus: () => ({ data: mockJobData.value }),
}));

jest.mock('@/hooks/useHabits', () => ({
  useCreateHabits: () => ({ mutateAsync: jest.fn(), isPending: false }),
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

describe('HabitsReviewStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJobData.value = {
      status: 'complete',
      result: {
        habits: [
          {
            title: 'Meditate',
            frequency: 'daily',
            minimum_version: '1 min',
            normal_version: '10 min',
            position: 1,
          },
          {
            title: 'Read',
            frequency: 'daily',
            minimum_version: '1 pg',
            normal_version: '10 pg',
            position: 2,
          },
          {
            title: 'Walk',
            frequency: 'daily',
            minimum_version: '5 min',
            normal_version: '30 min',
            position: 3,
          },
        ],
      },
    };
  });

  it('shows the 4th-habit MVP tooltip when Add is tapped', async () => {
    const { findByTestId } = render(
      <Wrapper>
        <HabitsReviewStep smartGoalId={1} onHabitsCreated={jest.fn()} />
      </Wrapper>,
    );
    const addBtn = await findByTestId('habits-add-attempt');
    fireEvent.press(addBtn);
    const tooltip = await findByTestId('habits-mvp-tooltip');
    expect(tooltip).toBeTruthy();
  });
});
