import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import MenuScreen from '../../app/(tabs)/menu';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock TokenManager
const mockGetValidToken = jest.fn();
const mockStoreToken = jest.fn();
const mockClearToken = jest.fn();

jest.mock('../../utils/api', () => ({
  TokenManager: {
    getInstance: jest.fn(() => ({
      getValidToken: mockGetValidToken,
      storeToken: mockStoreToken,
      clearToken: mockClearToken,
    })),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('MenuScreen', () => {
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

    // Mock TokenManager methods
    mockGetValidToken.mockResolvedValue('test-token');
    mockStoreToken.mockResolvedValue(undefined);
    mockClearToken.mockResolvedValue(undefined);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {component}
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('renders all menu items correctly', () => {
    renderWithProviders(<MenuScreen />);

    // Check if all menu items are displayed
    expect(screen.getByTestId('menu-item-text-profile')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-smart-goals')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-settings')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-help')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-about')).toBeTruthy();
  });

  it('handles profile menu item press', () => {
    const mockRouter = require('expo-router').router;

    renderWithProviders(<MenuScreen />);

    const profileButton = screen.getByTestId('menu-item-profile');
    fireEvent.press(profileButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/profile');
  });

  it('handles goals menu item press', () => {
    const mockRouter = require('expo-router').router;

    renderWithProviders(<MenuScreen />);

    const goalsButton = screen.getByTestId('menu-item-smart-goals');
    fireEvent.press(goalsButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/smartGoals');
  });

  it('handles settings menu item press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    renderWithProviders(<MenuScreen />);

    const settingsButton = screen.getByTestId('menu-item-settings');
    fireEvent.press(settingsButton);

    expect(consoleSpy).toHaveBeenCalledWith('Settings pressed');

    consoleSpy.mockRestore();
  });

  it('handles help & support menu item press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    renderWithProviders(<MenuScreen />);

    const helpButton = screen.getByTestId('menu-item-help');
    fireEvent.press(helpButton);

    expect(consoleSpy).toHaveBeenCalledWith('Help pressed');

    consoleSpy.mockRestore();
  });

  it('handles about menu item press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    renderWithProviders(<MenuScreen />);

    const aboutButton = screen.getByTestId('menu-item-about');
    fireEvent.press(aboutButton);

    expect(consoleSpy).toHaveBeenCalledWith('About pressed');

    consoleSpy.mockRestore();
  });

  it('renders menu items with correct structure', () => {
    renderWithProviders(<MenuScreen />);

    // Check if menu items are rendered as pressable elements
    expect(screen.getByTestId('menu-item-text-profile')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-smart-goals')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-settings')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-help')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-about')).toBeTruthy();
  });

  it('has proper menu item styling and layout', () => {
    renderWithProviders(<MenuScreen />);

    // The menu should be rendered as a scrollable list
    // Each item should be pressable
    const profileButton = screen.getByTestId('menu-item-profile');
    const goalsButton = screen.getByTestId('menu-item-smart-goals');
    const settingsButton = screen.getByTestId('menu-item-settings');
    const helpButton = screen.getByTestId('menu-item-help');
    const aboutButton = screen.getByTestId('menu-item-about');

    expect(profileButton).toBeTruthy();
    expect(goalsButton).toBeTruthy();
    expect(settingsButton).toBeTruthy();
    expect(helpButton).toBeTruthy();
    expect(aboutButton).toBeTruthy();
  });

  it('handles multiple menu item presses correctly', () => {
    const mockRouter = require('expo-router').router;
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    renderWithProviders(<MenuScreen />);

    // Press multiple menu items
    fireEvent.press(screen.getByTestId('menu-item-profile'));
    fireEvent.press(screen.getByTestId('menu-item-smart-goals'));
    fireEvent.press(screen.getByTestId('menu-item-settings'));

    expect(mockRouter.push).toHaveBeenCalledWith('/profile');
    expect(mockRouter.push).toHaveBeenCalledWith('/smartGoals');
    expect(consoleSpy).toHaveBeenCalledWith('Settings pressed');

    consoleSpy.mockRestore();
  });
}); 