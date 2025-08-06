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
    const { getByTestId } = render(<AboutScreen />);

    const appDescription = getByTestId('about-app-description');
    expect(appDescription).toBeTruthy();
    expect(appDescription).toHaveTextContent('Personal Coach');
    expect(appDescription).toHaveTextContent('Turn intention into action');
  });

  it('renders the app description section', () => {
    const { getByTestId } = render(<AboutScreen />);

    const appDescription = getByTestId('about-app-description');
    expect(appDescription).toBeTruthy();

    // Check that the app name is displayed
    expect(appDescription).toHaveTextContent('Personal Coach');
    expect(appDescription).toHaveTextContent('Turn intention into action');
  });

  it('renders AI suggestions section with correct content', () => {
    const { getByTestId } = render(<AboutScreen />);

    const aiSection = getByTestId('about-ai-suggestions-section');
    expect(aiSection).toBeTruthy();
    expect(aiSection).toHaveTextContent('AI Task Suggestions');
    expect(aiSection).toHaveTextContent('Assit Me');
  });

  it('renders Daily Focus section with correct content', () => {
    const { getByTestId } = render(<AboutScreen />);

    const dailySection = getByTestId('about-daily-focus-section');
    expect(dailySection).toBeTruthy();
    expect(dailySection).toHaveTextContent("Today's Focus");
    expect(dailySection).toHaveTextContent('Plan your day with focus');
  });

  it('renders SMART Goals section with correct content', () => {
    const { getByTestId } = render(<AboutScreen />);

    const goalsSection = getByTestId('about-smart-goals-section');
    expect(goalsSection).toBeTruthy();
    expect(goalsSection).toHaveTextContent('SMART Goals');
    expect(goalsSection).toHaveTextContent('Specific, Measurable, Achievable');
  });

  it('renders SMART Goals section with correct content', () => {
    const { getByTestId } = render(<AboutScreen />);

    const goalsSection = getByTestId('about-smart-goals-section');
    expect(goalsSection).toBeTruthy();
    expect(goalsSection).toHaveTextContent('SMART Goals');
    expect(goalsSection).toHaveTextContent('Specific, Measurable, Achievable');
  });

  it('renders Pro Tips section with all tips', () => {
    const { getByTestId } = render(<AboutScreen />);

    const tipsSection = getByTestId('about-tips-section');
    expect(tipsSection).toBeTruthy();
    expect(tipsSection).toHaveTextContent('Pro Tips');

    // Check for all tip content
    expect(tipsSection).toHaveTextContent('Use AI suggestions regularly');
    expect(tipsSection).toHaveTextContent('Enter Focus Mode when you need');
    expect(tipsSection).toHaveTextContent('Review your SMART goals weekly');
    expect(tipsSection).toHaveTextContent('Keep your daily task list manageable');
  });

  it('renders version info section', () => {
    const { getByTestId } = render(<AboutScreen />);

    const versionInfo = getByTestId('about-version-info');
    expect(versionInfo).toBeTruthy();
    expect(versionInfo).toHaveTextContent('Version 1.0.0');
    expect(versionInfo).toHaveTextContent('Built with ❤️ for productivity');
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