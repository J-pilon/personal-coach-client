import { render } from '@testing-library/react-native';
import React from 'react';
import AboutScreen from '../../app/about/index';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock the LinearGradient component
jest.mock('@/components/ui/LinearGradient', () => {
  const { View } = require('react-native');
  return function LinearGradient({ children }: { children: React.ReactNode }) {
    return <View testID="linear-gradient">{children}</View>;
  };
});

describe('AboutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the about screen with app description', () => {
    const { getByTestId, getByText } = render(<AboutScreen />);

    const appDescription = getByTestId('about-app-description');
    expect(appDescription).toBeTruthy();
    expect(getByText('Personal Coach')).toBeTruthy();
    expect(getByText('Turn intention into action')).toBeTruthy();
  });

  it('renders the app description section', () => {
    const { getByTestId, getByText } = render(<AboutScreen />);

    const appDescription = getByTestId('about-app-description');
    expect(appDescription).toBeTruthy();

    // Check that the app name is displayed
    expect(getByText('Personal Coach')).toBeTruthy();
    expect(getByText('Turn intention into action')).toBeTruthy();
  });

  it('renders AI suggestions section with correct content', () => {
    const { getByTestId, getByText } = render(<AboutScreen />);

    const aiSection = getByTestId('about-ai-suggestions-section');
    expect(aiSection).toBeTruthy();
    expect(getByText('AI Task Suggestions')).toBeTruthy();
    expect(getByText('Assit Me')).toBeTruthy();
  });

  it('renders Daily Focus section with correct content', () => {
    const { getByTestId, getByText } = render(<AboutScreen />);

    const dailySection = getByTestId('about-daily-focus-section');
    expect(dailySection).toBeTruthy();
    expect(getByText("Today's Focus")).toBeTruthy();
    expect(getByText('Plan your day with focus')).toBeTruthy();
  });

  it('renders SMART Goals section with correct content', () => {
    const { getByTestId, getByText } = render(<AboutScreen />);

    const goalsSection = getByTestId('about-smart-goals-section');
    expect(goalsSection).toBeTruthy();
    expect(getByText('SMART Goals')).toBeTruthy();
    expect(getByText('Specific, Measurable, Achievable')).toBeTruthy();
  });

  it('renders SMART Goals section with correct content', () => {
    const { getByTestId, getByText } = render(<AboutScreen />);

    const goalsSection = getByTestId('about-smart-goals-section');
    expect(goalsSection).toBeTruthy();
    expect(getByText('SMART Goals')).toBeTruthy();
    expect(getByText('Specific, Measurable, Achievable')).toBeTruthy();
  });

  it('renders Pro Tips section with all tips', () => {
    const { getByTestId, getByText } = render(<AboutScreen />);

    const tipsSection = getByTestId('about-tips-section');
    expect(tipsSection).toBeTruthy();
    expect(getByText('Pro Tips')).toBeTruthy();

    // Check for all tip content
    expect(getByText('Use AI suggestions regularly')).toBeTruthy();
    expect(getByText('Enter Focus Mode when you need')).toBeTruthy();
    expect(getByText('Review your SMART goals weekly')).toBeTruthy();
    expect(getByText('Keep your daily task list manageable')).toBeTruthy();
  });

  it('renders version info section', () => {
    const { getByTestId, getByText } = render(<AboutScreen />);

    const versionInfo = getByTestId('about-version-info');
    expect(versionInfo).toBeTruthy();
    expect(getByText('Version 1.0.0')).toBeTruthy();
    expect(getByText('Built with ❤️ for productivity')).toBeTruthy();
  });

  it('renders without back button', () => {
    const { queryByTestId } = render(<AboutScreen />);

    // Back button should not exist since it was removed
    const backButton = queryByTestId('about-back-button');
    expect(backButton).toBeNull();
  });

  it('renders all feature sections with proper styling', () => {
    const { getByTestId } = render(<AboutScreen />);

    // Check that all sections are rendered
    const sections = [
      'about-ai-suggestions-section',
      'about-daily-focus-section',
      'about-smart-goals-section',
      'about-tips-section'
    ];

    sections.forEach(testID => {
      const section = getByTestId(testID);
      expect(section).toBeTruthy();
    });
  });

  it('renders with proper gradient background', () => {
    const { getByTestId } = render(<AboutScreen />);

    const gradient = getByTestId('linear-gradient');
    expect(gradient).toBeTruthy();
  });

  it('displays all icons correctly', () => {
    const { getByTestId } = render(<AboutScreen />);

    // Check that all sections have their respective icons
    const sections = [
      { testID: 'about-ai-suggestions-section', iconName: 'bulb-outline' },
      { testID: 'about-daily-focus-section', iconName: 'eye-outline' },
      { testID: 'about-smart-goals-section', iconName: 'star-outline' },
      { testID: 'about-tips-section', iconName: 'bulb-outline' }
    ];

    sections.forEach(({ testID }) => {
      const section = getByTestId(testID);
      expect(section).toBeTruthy();
    });
  });
}); 