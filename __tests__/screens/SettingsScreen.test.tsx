import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { Alert } from 'react-native';
import SettingsScreen from '../../app/settings';

import { useAiSettings } from '../../hooks/useAiSettings';

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
  apiPost: jest.fn(),
}));

// Mock the useAiSettings hook
const mockSetApiKey = jest.fn();
const mockClearApiKey = jest.fn();
const mockGetStoredApiKey = jest.fn();
const mockRefetchUsage = jest.fn();

jest.mock('../../hooks/useAiSettings', () => ({
  useAiSettings: jest.fn(),
}));

const mockUseAiSettings = useAiSettings as jest.MockedFunction<typeof useAiSettings>;

describe('SettingsScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();

    // Mock Alert.alert
    jest.spyOn(Alert, 'alert').mockImplementation(() => { });

    // Default mock implementation
    mockUseAiSettings.mockReturnValue({
      setApiKey: mockSetApiKey,
      clearApiKey: mockClearApiKey,
      getStoredApiKey: mockGetStoredApiKey,
      usageInfo: {
        using_own_key: false,
        remaining: 3,
      },
      isLoading: false,
      error: undefined,
      refetchUsage: mockRefetchUsage,
    });

    // Mock SecureStore
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('should render usage info section', async () => {
      mockUseAiSettings.mockReturnValue({
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        getStoredApiKey: mockGetStoredApiKey,
        usageInfo: {
          using_own_key: false,
          remaining: 3,
        },
        isLoading: false,
        error: undefined,
        refetchUsage: mockRefetchUsage,
      });

      const { getByText } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Using demo key')).toBeTruthy();
        expect(getByText('3 requests remaining today')).toBeTruthy();
      });
    });

    it('should render loading state', async () => {
      mockUseAiSettings.mockReturnValue({
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        getStoredApiKey: mockGetStoredApiKey,
        usageInfo: undefined,
        isLoading: true,
        error: undefined,
        refetchUsage: mockRefetchUsage,
      });

      const { getByText } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Loading usage info...')).toBeTruthy();
      });
    });
  });

  describe('Usage Info Display', () => {
    it('should show demo key usage info', async () => {
      mockUseAiSettings.mockReturnValue({
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        getStoredApiKey: mockGetStoredApiKey,
        usageInfo: {
          using_own_key: false,
          remaining: 2,
        },
        isLoading: false,
        error: undefined,
        refetchUsage: mockRefetchUsage,
      });

      const { getByText } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Using demo key')).toBeTruthy();
        expect(getByText('2 requests remaining today')).toBeTruthy();
      });
    });

    it('should show own key usage info', async () => {
      mockUseAiSettings.mockReturnValue({
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        getStoredApiKey: mockGetStoredApiKey,
        usageInfo: {
          using_own_key: true,
          remaining: 0,
        },
        isLoading: false,
        error: undefined,
        refetchUsage: mockRefetchUsage,
      });

      const { getByText } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Using your own key')).toBeTruthy();
        expect(getByText('Unlimited requests')).toBeTruthy();
      });
    });
  });

  describe('API Key Management', () => {
    it('should show "Add Key" button when no API key is stored', async () => {
      mockGetStoredApiKey.mockResolvedValue(undefined);

      const { getByTestId } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        expect(getByTestId('add-key-button')).toBeTruthy();
      });
    });

    it('should show "Change Key" and "Clear Key" buttons when API key is stored', async () => {
      mockGetStoredApiKey.mockResolvedValue('test-api-key');

      const { getByTestId } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        expect(getByTestId('change-key-button')).toBeTruthy();
        expect(getByTestId('clear-key-button')).toBeTruthy();
      });
    });

    it('should enter edit mode when "Change Key" button is pressed', async () => {
      mockGetStoredApiKey.mockResolvedValue('test-api-key');

      const { getByTestId } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        const changeKeyButton = getByTestId('change-key-button');
        fireEvent.press(changeKeyButton);
      });

      expect(getByTestId('api-key-input')).toBeTruthy();
      expect(getByTestId('save-key-button')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();
    });

    it('should save API key successfully', async () => {
      mockGetStoredApiKey.mockResolvedValue(undefined);
      mockSetApiKey.mockResolvedValue(undefined);

      const { getByTestId } = renderWithQueryClient(<SettingsScreen />);

      // Wait for component to load and enter edit mode
      await waitFor(() => {
        const addKeyButton = getByTestId('add-key-button');
        fireEvent.press(addKeyButton);
      });

      // Enter API key
      const apiKeyInput = getByTestId('api-key-input');
      fireEvent.changeText(apiKeyInput, 'new-api-key');

      // Save the key
      const saveButton = getByTestId('save-key-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockSetApiKey).toHaveBeenCalledWith('new-api-key');
      });
    });

    it('should show error when trying to save empty API key', async () => {
      mockGetStoredApiKey.mockResolvedValue(undefined);

      const { getByTestId } = renderWithQueryClient(<SettingsScreen />);

      // Wait for component to load and enter edit mode
      await waitFor(() => {
        const addKeyButton = getByTestId('add-key-button');
        fireEvent.press(addKeyButton);
      });

      // Try to save empty key
      const saveButton = getByTestId('save-key-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid API key');
      });
    });

    it('should cancel editing and restore original value', async () => {
      mockGetStoredApiKey.mockResolvedValue('original-key');

      const { getByTestId } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        const changeKeyButton = getByTestId('change-key-button');
        fireEvent.press(changeKeyButton);
      });

      // Modify the input
      const apiKeyInput = getByTestId('api-key-input');
      fireEvent.changeText(apiKeyInput, 'modified-key');

      // Cancel editing
      const cancelButton = getByTestId('cancel-button');
      fireEvent.press(cancelButton);

      // Should be back to view mode
      expect(getByTestId('change-key-button')).toBeTruthy();
    });

    it('should clear API key with confirmation', async () => {
      mockGetStoredApiKey.mockResolvedValue('test-api-key');
      mockClearApiKey.mockResolvedValue(undefined);

      const { getByTestId } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        const clearKeyButton = getByTestId('clear-key-button');
        fireEvent.press(clearKeyButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Clear API Key',
        'Are you sure you want to clear your API key? You will be limited to 3 AI requests per day.',
        expect.any(Array)
      );
    });
  });

  describe('Error Handling', () => {
    it('should display error message when there is an error', async () => {
      mockUseAiSettings.mockReturnValue({
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        getStoredApiKey: mockGetStoredApiKey,
        usageInfo: undefined,
        isLoading: false,
        error: 'Failed to load usage info',
        refetchUsage: mockRefetchUsage,
      });

      const { getByText } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        expect(getByText('Error: Failed to load usage info')).toBeTruthy();
      });
    });

    it('should handle API key save error', async () => {
      mockGetStoredApiKey.mockResolvedValue(undefined);
      mockSetApiKey.mockRejectedValue(new Error('Save failed'));

      const { getByTestId } = renderWithQueryClient(<SettingsScreen />);

      // Wait for component to load and enter edit mode
      await waitFor(() => {
        const addKeyButton = getByTestId('add-key-button');
        fireEvent.press(addKeyButton);
      });

      // Enter API key
      const apiKeyInput = getByTestId('api-key-input');
      fireEvent.changeText(apiKeyInput, 'new-api-key');

      // Save the key
      const saveButton = getByTestId('save-key-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save API key. Please try again.');
      });
    });

    it('should handle API key clear error', async () => {
      mockGetStoredApiKey.mockResolvedValue('test-api-key');
      mockClearApiKey.mockRejectedValue(new Error('Clear failed'));

      const { getByTestId } = renderWithQueryClient(<SettingsScreen />);

      await waitFor(() => {
        const clearKeyButton = getByTestId('clear-key-button');
        fireEvent.press(clearKeyButton);
      });

      // Simulate user confirming the clear action
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const clearAction = alertCall[2]?.find((action: any) => action.text === 'Clear');
      clearAction?.onPress();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to clear API key');
      });
    });
  });
}); 