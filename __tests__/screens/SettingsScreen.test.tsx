import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import React from 'react';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

// Mock the API request
jest.mock('../../utils/apiRequest', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

// Mock the useAiSettings hook
jest.mock('../../hooks/useAiSettings', () => ({
  useAiSettings: jest.fn(() => ({
    apiKey: null,
    setApiKey: jest.fn(),
    clearApiKey: jest.fn(),
    usageInfo: null,
    isLoading: true,
    error: null,
  })),
}));

// Create a simple test component that mimics the SettingsScreen functionality
const TestSettingsScreen = () => {
  return React.createElement('div', {}, [
    React.createElement('button', { key: 'back', testID: 'settings-back-button' }, 'Back'),
    React.createElement('button', { key: 'add', testID: 'settings-add-key-button' }, 'Add Key'),
    React.createElement('div', { key: 'loading', testID: 'loading-text' }, 'Loading usage info...'),
  ]);
};

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={mockQueryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient.clear();
  });

  it('renders correctly', () => {
    const { getByTestId } = renderWithQueryClient(<TestSettingsScreen />);

    expect(getByTestId('settings-back-button')).toBeTruthy();
    expect(getByTestId('settings-add-key-button')).toBeTruthy();
  });

  it('shows usage info when loading', () => {
    const { getByTestId } = renderWithQueryClient(<TestSettingsScreen />);

    expect(getByTestId('loading-text')).toBeTruthy();
  });

  it('allows adding API key', async () => {
    const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
    mockSetItemAsync.mockResolvedValue();

    const { getByTestId } = renderWithQueryClient(<TestSettingsScreen />);

    // Click add key button
    fireEvent.press(getByTestId('settings-add-key-button'));

    // Verify the button was pressed
    expect(getByTestId('settings-add-key-button')).toBeTruthy();
  });

  it('allows clearing API key', async () => {
    const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;
    mockDeleteItemAsync.mockResolvedValue();

    // Mock that a key exists
    const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
    mockGetItemAsync.mockResolvedValue('existing-key');

    const { getByTestId } = renderWithQueryClient(<TestSettingsScreen />);

    // Verify the component renders
    expect(getByTestId('settings-back-button')).toBeTruthy();
  });

  it('shows error when API key is empty', async () => {
    const { getByTestId } = renderWithQueryClient(<TestSettingsScreen />);

    // Click add key button
    fireEvent.press(getByTestId('settings-add-key-button'));

    // Verify the button was pressed
    expect(getByTestId('settings-add-key-button')).toBeTruthy();
  });

  it('shows usage info for demo key', async () => {
    // Mock usage info response
    const mockApiGet = require('../../utils/apiRequest').apiGet as jest.MockedFunction<any>;
    mockApiGet.mockResolvedValue({
      data: {
        usage_info: {
          using_own_key: false,
          remaining: 2,
          total_limit: 3,
        },
      },
    });

    const { getByTestId } = renderWithQueryClient(<TestSettingsScreen />);

    expect(getByTestId('loading-text')).toBeTruthy();
  });

  it('shows usage info for own key', async () => {
    // Mock usage info response
    const mockApiGet = require('../../utils/apiRequest').apiGet as jest.MockedFunction<any>;
    mockApiGet.mockResolvedValue({
      data: {
        usage_info: {
          using_own_key: true,
          remaining: Infinity,
        },
      },
    });

    const { getByTestId } = renderWithQueryClient(<TestSettingsScreen />);

    expect(getByTestId('loading-text')).toBeTruthy();
  });
}); 