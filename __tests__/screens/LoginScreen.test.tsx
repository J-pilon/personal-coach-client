import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import LoginScreen from '../../app/auth/login';
import { AuthProvider } from '../../hooks/useAuth';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

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

  it('shows validation error when fields are empty', async () => {
    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    const signInButton = screen.getByTestId('login-signin-button');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    });
  });

  it('handles successful sign in', async () => {
    mockSignIn.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const signInButton = screen.getByTestId('login-signin-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
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

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const signInButton = screen.getByTestId('login-signin-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Sign In Failed', errorMessage);
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

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const signInButton = screen.getByTestId('login-signin-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    // Check that loading indicator appears
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

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const signInButton = screen.getByTestId('login-signin-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(signInButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  it('validates email format', async () => {
    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const signInButton = screen.getByTestId('login-signin-button');

    // Test with invalid email format
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    // Should still attempt sign in (validation happens on server)
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('invalid-email', 'password123');
    });
  });
}); 