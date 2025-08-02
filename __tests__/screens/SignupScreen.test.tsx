import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import SignupScreen from '../../app/auth/signup';
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

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form correctly', () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    expect(screen.getByTestId('signup-title')).toBeTruthy();
    expect(screen.getByTestId('signup-subtitle')).toBeTruthy();
    expect(screen.getByTestId('signup-email-input')).toBeTruthy();
    expect(screen.getByTestId('signup-password-input')).toBeTruthy();
    expect(screen.getByTestId('signup-password-confirmation-input')).toBeTruthy();
    expect(screen.getByTestId('signup-signup-button')).toBeTruthy();
    expect(screen.getByTestId('signup-signin-link')).toBeTruthy();
  });

  it('shows validation error when fields are empty', async () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const signupButton = screen.getByTestId('signup-signup-button');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    });
  });

  it('shows validation error when passwords do not match', async () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const passwordConfirmationInput = screen.getByTestId('signup-password-confirmation-input');
    const signupButton = screen.getByTestId('signup-signup-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(passwordConfirmationInput, 'differentpassword');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
    });
  });

  it('shows validation error when password is too short', async () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const passwordConfirmationInput = screen.getByTestId('signup-password-confirmation-input');
    const signupButton = screen.getByTestId('signup-signup-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.changeText(passwordConfirmationInput, '123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password must be at least 6 characters long');
    });
  });

  it('handles successful sign up', async () => {
    mockSignUp.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const passwordConfirmationInput = screen.getByTestId('signup-password-confirmation-input');
    const signupButton = screen.getByTestId('signup-signup-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(passwordConfirmationInput, 'password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'password123');
    });
  });

  it('handles sign up error', async () => {
    const errorMessage = 'Email already exists';
    mockSignUp.mockRejectedValue(new Error(errorMessage));

    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const passwordConfirmationInput = screen.getByTestId('signup-password-confirmation-input');
    const signupButton = screen.getByTestId('signup-signup-button');

    fireEvent.changeText(emailInput, 'existing@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(passwordConfirmationInput, 'password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Sign Up Failed', errorMessage);
    });
  });

  it('navigates to signin screen when signin link is pressed', () => {
    const mockRouter = require('expo-router').router;

    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const signinLink = screen.getByTestId('signup-signin-link');
    fireEvent.press(signinLink);

    expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
  });

  it('shows loading state during sign up', async () => {
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const passwordConfirmationInput = screen.getByTestId('signup-password-confirmation-input');
    const signupButton = screen.getByTestId('signup-signup-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(passwordConfirmationInput, 'password123');
    fireEvent.press(signupButton);

    // Check that loading indicator appears
    await waitFor(() => {
      expect(screen.getByTestId('signup-loading-indicator')).toBeTruthy();
    });
  });

  it('disables sign up button during loading', async () => {
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const passwordConfirmationInput = screen.getByTestId('signup-password-confirmation-input');
    const signupButton = screen.getByTestId('signup-signup-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(passwordConfirmationInput, 'password123');
    fireEvent.press(signupButton);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(signupButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  it('validates email format', async () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const passwordConfirmationInput = screen.getByTestId('signup-password-confirmation-input');
    const signupButton = screen.getByTestId('signup-signup-button');

    // Test with invalid email format
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(passwordConfirmationInput, 'password123');
    fireEvent.press(signupButton);

    // Should still attempt sign up (validation happens on server)
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('invalid-email', 'password123', 'password123');
    });
  });

  it('handles partial field validation', async () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const signupButton = screen.getByTestId('signup-signup-button');

    // Fill only email and password, leave confirmation empty
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    });
  });
}); 