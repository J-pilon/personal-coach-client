module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/index.ts',
    '!**/App.tsx'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000, // 10 second timeout for individual tests
  // Force exit after tests complete to prevent hanging
  forceExit: true,
}; 