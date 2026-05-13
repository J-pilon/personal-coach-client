import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import PasswordResetConfirmScreen from '../../app/auth/password-reset-confirm';
import { AuthProvider } from '../../hooks/useAuth';

const mockRouterReplace = jest.fn();
let mockSearchParams: Record<string, string | undefined> = {};

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: (...args: any[]) => mockRouterReplace(...args),
  },
  useLocalSearchParams: () => mockSearchParams,
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

const mockResetPassword = jest.fn();
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
    resetPassword: mockResetPassword,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('PasswordResetConfirmScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = { email: 'user@example.com' };
  });

  const renderScreen = () => render(
    <AuthProvider>
      <PasswordResetConfirmScreen />
    </AuthProvider>
  );

  it('renders the code, password, and confirmation inputs plus links', () => {
    renderScreen();

    expect(screen.getByTestId('password-reset-confirm-title')).toBeTruthy();
    expect(screen.getByTestId('password-reset-confirm-code-input')).toBeTruthy();
    expect(screen.getByTestId('password-reset-confirm-password-input')).toBeTruthy();
    expect(screen.getByTestId('password-reset-confirm-confirmation-input')).toBeTruthy();
    expect(screen.getByTestId('password-reset-confirm-submit-button')).toBeTruthy();
    expect(screen.getByTestId('password-reset-confirm-back-link')).toBeTruthy();
    expect(screen.getByTestId('password-reset-confirm-resend-link')).toBeTruthy();
  });

  it('shows the email in the subtitle when provided', () => {
    renderScreen();

    expect(screen.getByTestId('password-reset-confirm-subtitle').props.children).toContain('user@example.com');
  });

  describe('submit', () => {
    const fillForm = (code: string, password: string, confirmation: string) => {
      fireEvent.changeText(screen.getByTestId('password-reset-confirm-code-input'), code);
      fireEvent.changeText(screen.getByTestId('password-reset-confirm-password-input'), password);
      fireEvent.changeText(screen.getByTestId('password-reset-confirm-confirmation-input'), confirmation);
    };

    it('keeps the submit button disabled when any field is empty', () => {
      renderScreen();

      const button = screen.getByTestId('password-reset-confirm-submit-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
      fireEvent.press(button);
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('shows an inline error when passwords do not match', async () => {
      renderScreen();
      fillForm('code-abc', 'newpassword456', 'mismatch789');

      await waitFor(() => {
        expect(screen.getByTestId('password-reset-confirm-confirmation-error')).toBeTruthy();
      });
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('shows an inline error when the password is shorter than 6 characters', async () => {
      renderScreen();
      fillForm('code-abc', 'short', 'short');

      await waitFor(() => {
        expect(screen.getByTestId('password-reset-confirm-password-error')).toBeTruthy();
      });
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('calls resetPassword with the trimmed code and routes to login on success', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      renderScreen();
      fillForm('  code-abc  ', 'newpassword456', 'newpassword456');

      const button = screen.getByTestId('password-reset-confirm-submit-button');
      await waitFor(() => {
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('code-abc', 'newpassword456', 'newpassword456');
      });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Password reset successfully. Please sign in.');
        expect(mockRouterReplace).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('surfaces the server error via the toast on failure', async () => {
      mockResetPassword.mockRejectedValue(new Error('Reset password token has expired'));
      renderScreen();
      fillForm('code-abc', 'newpassword456', 'newpassword456');

      const button = screen.getByTestId('password-reset-confirm-submit-button');
      await waitFor(() => {
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Reset password token has expired');
      });
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });
  });

  describe('resend', () => {
    it('calls requestPasswordReset with the email and shows a success toast', async () => {
      mockRequestPasswordReset.mockResolvedValue(undefined);
      renderScreen();

      fireEvent.press(screen.getByTestId('password-reset-confirm-resend-link'));

      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalledWith('user@example.com');
        expect(mockToastSuccess).toHaveBeenCalledWith('Reset code resent. Check your email.');
      });
    });

    it('surfaces a server error via the toast when resend fails', async () => {
      mockRequestPasswordReset.mockRejectedValue(new Error('Service unavailable'));
      renderScreen();

      fireEvent.press(screen.getByTestId('password-reset-confirm-resend-link'));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Service unavailable');
      });
    });

    it('routes back to forgot-password when the email param is missing', () => {
      mockSearchParams = {};
      renderScreen();

      fireEvent.press(screen.getByTestId('password-reset-confirm-resend-link'));

      expect(mockToastError).toHaveBeenCalledWith('Go back and enter your email to resend the code');
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/forgot-password');
      expect(mockRequestPasswordReset).not.toHaveBeenCalled();
    });
  });

  it('routes back to login when the back link is pressed', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('password-reset-confirm-back-link'));

    expect(mockRouterReplace).toHaveBeenCalledWith('/auth/login');
  });
});
