import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ProfileDeferredStep from '../../../components/OnboardingWizardV2/steps/ProfileDeferredStep';

const mockUpdateProfile = jest.fn().mockResolvedValue({});

jest.mock('@/hooks/useUser', () => ({
  useProfile: () => ({ data: null }),
  useUpdateProfile: () => ({
    mutateAsync: (...a: any[]) => mockUpdateProfile(...a),
    isPending: false,
  }),
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

describe('ProfileDeferredStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exits without patching profile when "Maybe later" is tapped', () => {
    const onFinished = jest.fn();
    const { getByTestId } = render(
      <Wrapper>
        <ProfileDeferredStep onFinished={onFinished} />
      </Wrapper>,
    );
    fireEvent.press(getByTestId('profile-deferred-later'));
    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(onFinished).toHaveBeenCalled();
  });

  it('patches profile then exits on "Save and finish"', async () => {
    const onFinished = jest.fn();
    const { getByTestId } = render(
      <Wrapper>
        <ProfileDeferredStep onFinished={onFinished} />
      </Wrapper>,
    );
    fireEvent.changeText(
      getByTestId('profile-deferred-first-name'),
      'Ada',
    );
    fireEvent.press(getByTestId('profile-deferred-save'));
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: 'Ada' }),
      );
      expect(onFinished).toHaveBeenCalled();
    });
  });
});
