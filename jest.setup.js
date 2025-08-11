// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
};

jest.mock('expo-router', () => ({
  __esModule: true,
  router: mockRouter,
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => mockRouter),
  Link: ({ children, href, ...props }) => {
    const MockLink = require('react-native').Pressable;
    return require('react').createElement(MockLink, { onPress: () => jest.fn(), ...props }, children);
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');

// Mock react-native-css-interop
jest.mock('react-native-css-interop', () => ({
  __esModule: true,
  default: {},
}));

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