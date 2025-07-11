// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    setParams: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    setParams: jest.fn(),
  })),
  Link: ({ children, href, ...props }) => {
    const MockLink = require('react-native').Pressable;
    return require('react').createElement(MockLink, { onPress: () => jest.fn(), ...props }, children);
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');

// Global test setup
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}; 