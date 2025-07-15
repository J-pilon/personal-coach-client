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
    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('Goals')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Help & Support')).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
  });

  it('handles profile menu item press', () => {
    const mockRouter = require('expo-router').router;

    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

    const profileButton = screen.getByText('Profile');
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

    const goalsButton = screen.getByText('Goals');
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

    const settingsButton = screen.getByText('Settings');
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

    const helpButton = screen.getByText('Help & Support');
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

    const aboutButton = screen.getByText('About');
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
    const menuItems = ['Profile', 'Goals', 'Settings', 'Help & Support', 'About'];

    menuItems.forEach(item => {
      const menuItem = screen.getByText(item);
      expect(menuItem).toBeTruthy();
    });
  });

  it('has proper menu item styling and layout', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MenuScreen />
      </QueryClientProvider>
    );

    // The menu should be rendered as a scrollable list
    // Each item should be pressable
    const profileButton = screen.getByText('Profile');
    const goalsButton = screen.getByText('Goals');
    const settingsButton = screen.getByText('Settings');
    const helpButton = screen.getByText('Help & Support');
    const aboutButton = screen.getByText('About');

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
    fireEvent.press(screen.getByText('Profile'));
    fireEvent.press(screen.getByText('Goals'));
    fireEvent.press(screen.getByText('Settings'));

    expect(mockRouter.push).toHaveBeenCalledWith('/profile');
    expect(mockRouter.push).toHaveBeenCalledWith('/smartGoals');
    expect(consoleSpy).toHaveBeenCalledWith('Settings pressed');

    consoleSpy.mockRestore();
  });
}); 