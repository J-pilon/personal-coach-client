import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ReminderStep from '../../../components/OnboardingWizardV2/steps/ReminderStep';

const mockUpsert = jest.fn().mockResolvedValue({ id: 5, active: true });
const mockUpdateProfile = jest.fn().mockResolvedValue({});
const mockCompleteOnboarding = jest.fn().mockResolvedValue({});
const mockRegisterPush = jest.fn();

jest.mock('@/hooks/useNotificationSchedules', () => ({
  useUpsertNotificationSchedule: () => ({
    mutateAsync: (...a: any[]) => mockUpsert(...a),
  }),
}));

jest.mock('@/hooks/useUser', () => ({
  useProfile: () => ({ data: { id: 1 } }),
  useUpdateProfile: () => ({
    mutateAsync: (...a: any[]) => mockUpdateProfile(...a),
  }),
  useCompleteOnboarding: () => ({
    mutateAsync: (...a: any[]) => mockCompleteOnboarding(...a),
  }),
}));

jest.mock('@/utils/notifications', () => ({
  registerForPushNotificationsAsync: (...a: any[]) => mockRegisterPush(...a),
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

describe('ReminderStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves schedule + advances when permission is granted', async () => {
    mockRegisterPush.mockResolvedValue('ExponentPushToken[abc]');
    const onScheduleSaved = jest.fn();
    const { getByTestId } = render(
      <Wrapper>
        <ReminderStep onScheduleSaved={onScheduleSaved} />
      </Wrapper>,
    );
    fireEvent.press(getByTestId('reminder-slot-morning'));
    fireEvent.press(getByTestId('reminder-continue'));
    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'daily_check_in',
          local_time: '07:00:00',
          active: true,
        }),
      );
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ onboarding_version: 'v2' }),
      );
      expect(mockCompleteOnboarding).toHaveBeenCalled();
      expect(onScheduleSaved).toHaveBeenCalledWith(5, true);
    });
  });

  it('still saves schedule + shows banner when permission is denied', async () => {
    mockRegisterPush.mockRejectedValue(new Error('denied'));
    const onScheduleSaved = jest.fn();
    const { getByTestId, findByTestId } = render(
      <Wrapper>
        <ReminderStep onScheduleSaved={onScheduleSaved} />
      </Wrapper>,
    );
    fireEvent.press(getByTestId('reminder-slot-evening'));
    fireEvent.press(getByTestId('reminder-continue'));
    await waitFor(() =>
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ local_time: '19:00:00' }),
      ),
    );
    const banner = await findByTestId('reminder-permission-denied-banner');
    expect(banner).toBeTruthy();
    expect(onScheduleSaved).toHaveBeenCalledWith(5, false);
  });
});
