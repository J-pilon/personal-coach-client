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

// Mock AsyncStorage with proper native module mocking
jest.mock('@react-native-async-storage/async-storage', () => {
  const mockAsyncStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  };
  
  // Mock the native module that AsyncStorage depends on
  require('react-native').NativeModules.PlatformLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  };
  
  return mockAsyncStorage;
});

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
  getCurrentState: jest.fn(),
}));

// Mock React Query persistence
jest.mock('@tanstack/query-async-storage-persister', () => ({
  createAsyncStoragePersister: jest.fn(),
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