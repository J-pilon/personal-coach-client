import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  },
}));

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
  });

  it('renders all menu items correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

    // Check if all menu items are displayed
    expect(screen.getByTestId('menu-item-text-profile')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-smart-goals')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-settings')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-help')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-about')).toBeTruthy();
  });

  it('handles profile menu item press', () => {
    const mockRouter = require('expo-router').router;

    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

    const profileButton = screen.getByTestId('menu-item-profile');
    fireEvent.press(profileButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/profile');
  });

  it('handles goals menu item press', () => {
    const mockRouter = require('expo-router').router;

    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

    const goalsButton = screen.getByTestId('menu-item-smart-goals');
    fireEvent.press(goalsButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/smartGoals');
  });

  it('handles settings menu item press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

    const settingsButton = screen.getByTestId('menu-item-settings');
    fireEvent.press(settingsButton);

    expect(consoleSpy).toHaveBeenCalledWith('Settings pressed');

    consoleSpy.mockRestore();
  });

  it('handles help & support menu item press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

    const helpButton = screen.getByTestId('menu-item-help');
    fireEvent.press(helpButton);

    expect(consoleSpy).toHaveBeenCalledWith('Help pressed');

    consoleSpy.mockRestore();
  });

  it('handles about menu item press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

    const aboutButton = screen.getByTestId('menu-item-about');
    fireEvent.press(aboutButton);

    expect(consoleSpy).toHaveBeenCalledWith('About pressed');

    consoleSpy.mockRestore();
  });

  it('renders menu items with correct structure', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

    // Check if menu items are rendered as pressable elements
    expect(screen.getByTestId('menu-item-text-profile')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-smart-goals')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-settings')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-help')).toBeTruthy();
    expect(screen.getByTestId('menu-item-text-about')).toBeTruthy();
  });

  it('has proper menu item styling and layout', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

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

    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

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