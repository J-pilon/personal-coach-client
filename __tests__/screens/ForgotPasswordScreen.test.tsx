import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import ForgotPasswordScreen from '../../app/auth/forgot-password';
import { AuthProvider } from '../../hooks/useAuth';

const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: (...args: any[]) => mockRouterReplace(...args),
  },
}));

const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock('../../components/ToastManager', () => ({
  useToast: () => ({
    error: mockToastError,
    success: mockToastSuccess,
    info: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

const mockRequestPasswordReset = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    clearAuth: jest.fn(),
    requestPasswordReset: mockRequestPasswordReset,
    resetPassword: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => render(
    <AuthProvider>
      <ForgotPasswordScreen />
    </AuthProvider>
  );

  it('renders the email entry form', () => {
    renderScreen();

    expect(screen.getByTestId('forgot-password-title')).toBeTruthy();
    expect(screen.getByTestId('forgot-password-email-input')).toBeTruthy();
    expect(screen.getByTestId('forgot-password-submit-button')).toBeTruthy();
    expect(screen.getByTestId('forgot-password-back-link')).toBeTruthy();
  });

  it('keeps the submit button disabled while the email is empty', () => {
    renderScreen();

    const button = screen.getByTestId('forgot-password-submit-button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(button);
    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
  });

  it('navigates to the confirm screen with the email param on success', async () => {
    mockRequestPasswordReset.mockResolvedValue(undefined);
    renderScreen();

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'user@example.com');
    const button = screen.getByTestId('forgot-password-submit-button');
    await waitFor(() => {
      expect(button.props.accessibilityState?.disabled).toBe(false);
    });
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('user@example.com');
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('If that email is registered, we’ve sent a reset code.');
      expect(mockRouterReplace).toHaveBeenCalledWith({
        pathname: '/auth/password-reset-confirm',
        params: { email: 'user@example.com' },
      });
    });
  });

  it('surfaces the server error message via the toast on failure', async () => {
    mockRequestPasswordReset.mockRejectedValue(new Error('Service unavailable'));
    renderScreen();

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'user@example.com');
    const button = screen.getByTestId('forgot-password-submit-button');
    await waitFor(() => {
      expect(button.props.accessibilityState?.disabled).toBe(false);
    });
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Service unavailable');
    });
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('navigates back to login when the cancel link is pressed', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('forgot-password-back-link'));

    expect(mockRouterReplace).toHaveBeenCalledWith('/auth/login');
  });
});
