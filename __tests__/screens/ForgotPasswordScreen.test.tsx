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
jest.mock('../../components/ToastManager', () => ({
  useToast: () => ({
    error: mockToastError,
    success: jest.fn(),
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

  it('shows a validation error when the email field is empty', async () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('forgot-password-submit-button'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Please enter your email');
    });
    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
  });

  it('calls requestPasswordReset and shows the success state on success', async () => {
    mockRequestPasswordReset.mockResolvedValue(undefined);
    renderScreen();

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'user@example.com');
    fireEvent.press(screen.getByTestId('forgot-password-submit-button'));

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('user@example.com');
    });

    await waitFor(() => {
      expect(screen.getByTestId('forgot-password-title').props.children).toBe('Check Your Email');
    });

    expect(screen.queryByTestId('forgot-password-submit-button')).toBeNull();
    expect(screen.queryByTestId('forgot-password-email-input')).toBeNull();
  });

  it('surfaces the server error message via the toast on failure', async () => {
    mockRequestPasswordReset.mockRejectedValue(new Error('Service unavailable'));
    renderScreen();

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'user@example.com');
    fireEvent.press(screen.getByTestId('forgot-password-submit-button'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Service unavailable');
    });

    // Stays on the form, does not flip to the success state
    expect(screen.getByTestId('forgot-password-email-input')).toBeTruthy();
  });

  it('navigates back to login when the cancel link is pressed', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('forgot-password-back-link'));

    expect(mockRouterReplace).toHaveBeenCalledWith('/auth/login');
  });
});
