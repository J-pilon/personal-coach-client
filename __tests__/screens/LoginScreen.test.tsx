import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import LoginScreen from '../../app/auth/login';
import { AuthProvider } from '../../hooks/useAuth';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock toast
const mockToastError = jest.fn();
jest.mock('../../components/ToastManager', () => ({
  useToast: () => ({
    error: mockToastError,
    success: jest.fn(),
    info: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

// Mock the useAuth hook
const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockClearAuth = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isLoading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
    clearAuth: mockClearAuth,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const fillForm = (email: string, password: string) => {
  fireEvent.changeText(screen.getByTestId('login-email-input'), email);
  fireEvent.changeText(screen.getByTestId('login-password-input'), password);
};

const waitForButtonEnabled = async () => {
  const button = screen.getByTestId('login-signin-button');
  await waitFor(() => {
    expect(button.props.accessibilityState?.disabled).toBe(false);
  });
  return button;
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    expect(screen.getByTestId('login-title')).toBeTruthy();
    expect(screen.getByTestId('login-subtitle')).toBeTruthy();
    expect(screen.getByTestId('login-email-input')).toBeTruthy();
    expect(screen.getByTestId('login-password-input')).toBeTruthy();
    expect(screen.getByTestId('login-signin-button')).toBeTruthy();
    expect(screen.getByTestId('login-signup-link')).toBeTruthy();
  });

  it('keeps the submit button disabled while fields are empty', () => {
    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    const signInButton = screen.getByTestId('login-signin-button');
    expect(signInButton.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(signInButton);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('handles successful sign in', async () => {
    mockSignIn.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    fillForm('test@example.com', 'password123');
    const signInButton = await waitForButtonEnabled();
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('handles sign in error', async () => {
    const errorMessage = 'Invalid email or password';
    mockSignIn.mockRejectedValue(new Error(errorMessage));

    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    fillForm('test@example.com', 'wrongpassword');
    const signInButton = await waitForButtonEnabled();
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('navigates to signup screen when signup link is pressed', () => {
    const mockRouter = require('expo-router').router;

    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    const signupLink = screen.getByTestId('login-signup-link');
    fireEvent.press(signupLink);

    expect(mockRouter.push).toHaveBeenCalledWith('/auth/signup');
  });

  it('shows loading state during sign in', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    fillForm('test@example.com', 'password123');
    const signInButton = await waitForButtonEnabled();
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(screen.getByTestId('login-loading-indicator')).toBeTruthy();
    });
  });

  it('disables sign in button during loading', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    fillForm('test@example.com', 'password123');
    const signInButton = await waitForButtonEnabled();
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(signInButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  it('shows inline error for invalid email format', async () => {
    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    fillForm('invalid-email', 'password123');

    await waitFor(() => {
      expect(screen.getByTestId('login-email-error')).toBeTruthy();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
