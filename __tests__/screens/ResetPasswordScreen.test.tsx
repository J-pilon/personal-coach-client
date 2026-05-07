import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import ResetPasswordScreen from '../../app/reset-password';
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

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    clearAuth: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: mockResetPassword,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = { reset_password_token: 'valid-token-abc' };
  });

  const renderScreen = () => render(
    <AuthProvider>
      <ResetPasswordScreen />
    </AuthProvider>
  );

  describe('with a valid token in the deep link', () => {
    it('renders the reset password form', () => {
      renderScreen();

      expect(screen.getByTestId('reset-password-title')).toBeTruthy();
      expect(screen.getByTestId('reset-password-password-input')).toBeTruthy();
      expect(screen.getByTestId('reset-password-confirmation-input')).toBeTruthy();
      expect(screen.getByTestId('reset-password-submit-button')).toBeTruthy();
    });

    it('shows a validation error when fields are empty', async () => {
      renderScreen();

      fireEvent.press(screen.getByTestId('reset-password-submit-button'));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please fill in both fields');
      });
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('shows a validation error when passwords do not match', async () => {
      renderScreen();

      fireEvent.changeText(screen.getByTestId('reset-password-password-input'), 'newpassword456');
      fireEvent.changeText(screen.getByTestId('reset-password-confirmation-input'), 'mismatch789');
      fireEvent.press(screen.getByTestId('reset-password-submit-button'));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Passwords do not match');
      });
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('shows a validation error when the password is shorter than 6 characters', async () => {
      renderScreen();

      fireEvent.changeText(screen.getByTestId('reset-password-password-input'), 'short');
      fireEvent.changeText(screen.getByTestId('reset-password-confirmation-input'), 'short');
      fireEvent.press(screen.getByTestId('reset-password-submit-button'));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Password must be at least 6 characters long');
      });
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('calls resetPassword with the token and routes to login on success', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      renderScreen();

      fireEvent.changeText(screen.getByTestId('reset-password-password-input'), 'newpassword456');
      fireEvent.changeText(screen.getByTestId('reset-password-confirmation-input'), 'newpassword456');
      fireEvent.press(screen.getByTestId('reset-password-submit-button'));

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('valid-token-abc', 'newpassword456', 'newpassword456');
      });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Password reset successfully. Please sign in.');
        expect(mockRouterReplace).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('surfaces the server error via the toast on failure', async () => {
      mockResetPassword.mockRejectedValue(new Error('Reset password token has expired'));
      renderScreen();

      fireEvent.changeText(screen.getByTestId('reset-password-password-input'), 'newpassword456');
      fireEvent.changeText(screen.getByTestId('reset-password-confirmation-input'), 'newpassword456');
      fireEvent.press(screen.getByTestId('reset-password-submit-button'));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Reset password token has expired');
      });
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });
  });

  describe('without a token in the deep link', () => {
    beforeEach(() => {
      mockSearchParams = {};
    });

    it('renders the invalid-link fallback instead of the form', () => {
      renderScreen();

      expect(screen.getByTestId('reset-password-invalid-title')).toBeTruthy();
      expect(screen.getByTestId('reset-password-invalid-back-button')).toBeTruthy();
      expect(screen.queryByTestId('reset-password-password-input')).toBeNull();
    });

    it('routes back to login when the back button is pressed', () => {
      renderScreen();

      fireEvent.press(screen.getByTestId('reset-password-invalid-back-button'));

      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/login');
    });
  });
});
