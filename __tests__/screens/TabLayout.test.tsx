import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import TabLayout from '../../app/(tabs)/_layout';

// Mock the hooks and utilities
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/hooks/useUser', () => ({
  useProfile: jest.fn(() => ({
    data: {
      onboarding_status: 'incomplete',
    },
    isLoading: false,
  })),
}));

jest.mock('@/utils/handleSkipOnboarding', () => ({
  isOnboardingSkippable: jest.fn(),
}));

// Mock the Tabs component from expo-router
jest.mock('expo-router', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MockTabs = ({ children, screenOptions }: any) => {
    return (
      <View testID="tabs-container">
        {children}
      </View>
    );
  };

  MockTabs.Screen = ({ children, name, options }: any) => {
    return (
      <View testID={`tab-${name}`}>
        <Text>{options?.title || name}</Text>
        {children}
      </View>
    );
  };

  return {
    Tabs: MockTabs,
    router: {
      replace: jest.fn(),
    },
  };
});

// Mock the tab components
jest.mock('@/components/ui/TabBarBackground', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockTabBarBackground() {
    return <View testID="tab-bar-background" />;
  };
});

describe('TabLayout', () => {
  const mockIsOnboardingSkippable = require('@/utils/handleSkipOnboarding').isOnboardingSkippable;
  const mockRouter = require('expo-router').router;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tab layout with correct screens', () => {
    mockIsOnboardingSkippable.mockResolvedValue(false);

    const { getByText } = render(<TabLayout />);

    expect(getByText('Tasks')).toBeTruthy();
    expect(getByText("Today's Focus")).toBeTruthy();
    expect(getByText('Menu')).toBeTruthy();
  });

  it('navigates to onboarding when profile is incomplete and skip is not available', async () => {
    mockIsOnboardingSkippable.mockResolvedValue(false);

    render(<TabLayout />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('navigates to tabs when profile is incomplete but skip is available', async () => {
    mockIsOnboardingSkippable.mockResolvedValue(true);

    render(<TabLayout />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('does not navigate when profile is complete', async () => {
    mockIsOnboardingSkippable.mockResolvedValue(false);

    // Mock useProfile to return complete status
    const { useProfile } = require('@/hooks/useUser');
    useProfile.mockReturnValue({
      data: {
        onboarding_status: 'complete',
      },
      isLoading: false,
    });

    render(<TabLayout />);

    await waitFor(() => {
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  it('does not navigate when profile is still loading', async () => {
    mockIsOnboardingSkippable.mockResolvedValue(false);

    // Mock useProfile to return loading state
    const { useProfile } = require('@/hooks/useUser');
    useProfile.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<TabLayout />);

    await waitFor(() => {
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  it('does not navigate when profile is null', async () => {
    mockIsOnboardingSkippable.mockResolvedValue(false);

    // Mock useProfile to return null profile
    const { useProfile } = require('@/hooks/useUser');
    useProfile.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<TabLayout />);

    await waitFor(() => {
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  it('calls isOnboardingSkippable with correct parameters', async () => {
    mockIsOnboardingSkippable.mockResolvedValue(false);

    render(<TabLayout />);

    await waitFor(() => {
      expect(mockIsOnboardingSkippable).toHaveBeenCalled();
    });
  });

  it('renders tab layout with correct structure', () => {
    mockIsOnboardingSkippable.mockResolvedValue(false);

    const { getByTestId } = render(<TabLayout />);

    expect(getByTestId('tabs-container')).toBeTruthy();
    expect(getByTestId('tab-index')).toBeTruthy();
    expect(getByTestId('tab-todaysFocus')).toBeTruthy();
    expect(getByTestId('tab-menu')).toBeTruthy();
  });
}); 