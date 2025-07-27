import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import SplashScreen from '@/components/SplashScreen';
import { getRandomQuote } from '@/utils/quotes';

// Mock the quotes utility
jest.mock('@/utils/quotes', () => ({
  getRandomQuote: jest.fn(),
  motivationalQuotes: [],
}));

describe('SplashScreen', () => {
  const mockOnFinish = jest.fn();
  const mockQuote = {
    text: "Test motivational quote",
    author: "Test Author"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getRandomQuote as jest.Mock).mockReturnValue(mockQuote);
  });

  test('renders splash screen with quote', async () => {
    const { getByTestId } = render(<SplashScreen onFinish={mockOnFinish} />);

    await waitFor(() => {
      expect(getByTestId('splash-quote-text')).toBeTruthy();
      expect(getByTestId('splash-quote-author')).toBeTruthy();
    });
  });

  test('displays app branding', async () => {
    const { getByTestId } = render(<SplashScreen onFinish={mockOnFinish} />);

    await waitFor(() => {
      expect(getByTestId('splash-app-title')).toBeTruthy();
      expect(getByTestId('splash-app-tagline')).toBeTruthy();
    });
  });

  test('calls getRandomQuote on mount', () => {
    render(<SplashScreen onFinish={mockOnFinish} />);

    expect(getRandomQuote).toHaveBeenCalled();
  });

  test('displays continue button', async () => {
    const { getByTestId } = render(<SplashScreen onFinish={mockOnFinish} />);

    await waitFor(() => {
      expect(getByTestId('splash-continue-button')).toBeTruthy();
    });
  });

  test('calls onFinish when continue button is pressed', async () => {
    const { getByTestId } = render(<SplashScreen onFinish={mockOnFinish} />);

    await waitFor(() => {
      const continueButton = getByTestId('splash-continue-button');
      fireEvent.press(continueButton);
    });

    // Wait for the animation to complete and onFinish to be called
    await waitFor(() => {
      expect(mockOnFinish).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
}); 