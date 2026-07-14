import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import TodaysActionStep from '../../../components/OnboardingWizardV2/steps/TodaysActionStep';
import type { HabitModel } from '@/models/habit';

const mockCreateCompletion = jest.fn().mockResolvedValue({ id: 99 });

jest.mock('@/hooks/useHabitCompletions', () => ({
  useCreateHabitCompletion: () => ({
    mutateAsync: (...a: any[]) => mockCreateCompletion(...a),
    isPending: false,
  }),
}));

const habits: HabitModel[] = [
  {
    id: 10,
    profile_id: 1,
    smart_goal_id: 2,
    title: 'Meditate',
    frequency: 'daily',
    minimum_version: '1 min',
    normal_version: '10 min',
    position: 1,
  },
];

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

describe('TodaysActionStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('commits a habit and advances on Minimum tap', async () => {
    const onCommitted = jest.fn();
    const { getByTestId } = render(
      <Wrapper>
        <TodaysActionStep habits={habits} onCommitted={onCommitted} />
      </Wrapper>,
    );
    fireEvent.press(getByTestId('todays-action-minimum-1'));
    await waitFor(() => {
      expect(mockCreateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({ habit_id: 10, state: 'committed' }),
      );
      expect(onCommitted).toHaveBeenCalledWith(10);
    });
  });
});
