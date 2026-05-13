import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import SignupScreen from '../../app/auth/signup';
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
const mockToastSuccess = jest.fn();
jest.mock('../../components/ToastManager', () => ({
  useToast: () => ({
    error: mockToastError,
    success: mockToastSuccess,
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

const fillForm = (email: string, password: string, confirmation: string) => {
  fireEvent.changeText(screen.getByTestId('signup-email-input'), email);
  fireEvent.changeText(screen.getByTestId('signup-password-input'), password);
  fireEvent.changeText(screen.getByTestId('signup-password-confirmation-input'), confirmation);
};

const waitForButtonEnabled = async () => {
  const button = screen.getByTestId('signup-signup-button');
  await waitFor(() => {
    expect(button.props.accessibilityState?.disabled).toBe(false);
  });
  return button;
};

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

  it('keeps the submit button disabled while fields are empty', () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const signupButton = screen.getByTestId('signup-signup-button');
    expect(signupButton.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(signupButton);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows inline error when passwords do not match', async () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    fillForm('test@example.com', 'password123', 'differentpassword');

    await waitFor(() => {
      expect(screen.getByTestId('signup-password-confirmation-error')).toBeTruthy();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows inline error when password is too short', async () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    fillForm('test@example.com', '123', '123');

    await waitFor(() => {
      expect(screen.getByTestId('signup-password-error')).toBeTruthy();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('handles successful sign up', async () => {
    mockSignUp.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    fillForm('test@example.com', 'password123', 'password123');
    const signupButton = await waitForButtonEnabled();
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

    fillForm('existing@example.com', 'password123', 'password123');
    const signupButton = await waitForButtonEnabled();
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(errorMessage);
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

    fillForm('test@example.com', 'password123', 'password123');
    const signupButton = await waitForButtonEnabled();
    fireEvent.press(signupButton);

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

    fillForm('test@example.com', 'password123', 'password123');
    const signupButton = await waitForButtonEnabled();
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(signupButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  it('shows inline error for invalid email format', async () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    fillForm('invalid-email', 'password123', 'password123');

    await waitFor(() => {
      expect(screen.getByTestId('signup-email-error')).toBeTruthy();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('keeps the submit button disabled when only some fields are filled', async () => {
    render(
      <AuthProvider>
        <SignupScreen />
      </AuthProvider>
    );

    const signupButton = screen.getByTestId('signup-signup-button');

    fireEvent.changeText(screen.getByTestId('signup-email-input'), 'test@example.com');
    fireEvent.changeText(screen.getByTestId('signup-password-input'), 'password123');

    // confirmation left empty
    await waitFor(() => {
      expect(signupButton.props.accessibilityState?.disabled).toBe(true);
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});
