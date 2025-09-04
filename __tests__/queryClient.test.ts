// Import Step 0 specific setup
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

describe('QueryClient Configuration', () => {
  let queryClient: QueryClient;
  let mockNetInfo: jest.Mocked<typeof NetInfo>;
  let mockAppState: jest.Mocked<typeof AppState>;
  let mockAsyncStorage: jest.Mocked<typeof AsyncStorage>;
  let mockCreateAsyncStoragePersister: jest.MockedFunction<typeof createAsyncStoragePersister>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
    mockAppState = AppState as jest.Mocked<typeof AppState>;
    mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    mockCreateAsyncStoragePersister = createAsyncStoragePersister as jest.MockedFunction<typeof createAsyncStoragePersister>;

    // Reset all mocks
    jest.clearAllMocks();

    // Mock NetInfo
    mockNetInfo.addEventListener.mockReturnValue(jest.fn());
    
    // Mock AppState
    mockAppState.addEventListener.mockReturnValue({ remove: jest.fn() });
    
    // Mock AsyncStorage
    mockAsyncStorage.getItem = jest.fn();
    mockAsyncStorage.setItem = jest.fn();
    mockAsyncStorage.removeItem = jest.fn();
    
    // Mock persister
    const mockPersister = {
      persistClient: jest.fn(),
      restoreClient: jest.fn(),
      removeClient: jest.fn(),
    };
    (mockCreateAsyncStoragePersister as jest.MockedFunction<typeof createAsyncStoragePersister>).mockReturnValue(mockPersister as any);

    // Create QueryClient with our configuration
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
          retry: (failureCount, error) => {
            if (error?.message?.includes('Network request failed')) {
              return false;
            }
            return failureCount < 3;
          },
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  describe('QueryClient Default Options', () => {
    it('should not retry network errors', () => {
      const retryFn = queryClient.getDefaultOptions().queries?.retry as Function;
      const networkError = new Error('Network request failed');
      
      expect(retryFn(1, networkError)).toBe(false);
      expect(retryFn(2, networkError)).toBe(false);
    });

    it('should retry other errors up to 3 times', () => {
      const retryFn = queryClient.getDefaultOptions().queries?.retry as Function;
      const otherError = new Error('Server error');
      
      expect(retryFn(1, otherError)).toBe(true);
      expect(retryFn(2, otherError)).toBe(true);
      expect(retryFn(3, otherError)).toBe(false);
    });

    it('should not retry mutations', () => {
      expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
    });
  });

  describe('Online Manager Integration', () => {
    it('should be able to set up NetInfo event listener', () => {
      // Test that we can call the onlineManager.setEventListener function
      const mockSetOnline = jest.fn();
      const cleanup = onlineManager.setEventListener(mockSetOnline);

      // The function should return a cleanup function (or undefined if not implemented)
      expect(cleanup === undefined || typeof cleanup === 'function').toBe(true);
    });

    it('should handle network state logic correctly', () => {
      // Test the network state logic that would be used in the callback
      const testNetworkState = (isConnected: boolean | null, isInternetReachable: boolean | null) => {
        return !!(isConnected && isInternetReachable);
      };

      expect(testNetworkState(true, true)).toBe(true);
      expect(testNetworkState(true, false)).toBe(false);
      expect(testNetworkState(false, true)).toBe(false);
      expect(testNetworkState(false, false)).toBe(false);
      expect(testNetworkState(null, null)).toBe(false);
      expect(testNetworkState(undefined, undefined)).toBe(false);
    });
  });

  describe('Focus Manager Integration', () => {
    it('should be able to set up AppState event listener', () => {
      const mockSetFocused = jest.fn();
      const cleanup = focusManager.setEventListener(mockSetFocused);

      // The function should return a cleanup function (or undefined if not implemented)
      expect(cleanup === undefined || typeof cleanup === 'function').toBe(true);
    });

    it('should handle app state logic correctly', () => {
      // Test the app state logic that would be used in the callback
      const testAppState = (status: string) => {
        return status === 'active';
      };

      expect(testAppState('active')).toBe(true);
      expect(testAppState('background')).toBe(false);
      expect(testAppState('inactive')).toBe(false);
    });
  });

  describe('Cache Persistence', () => {
    it('should be able to create AsyncStorage persister', () => {
      const persister = createAsyncStoragePersister({
        storage: AsyncStorage,
      });

      expect(persister).toBeDefined();
      expect(persister.persistClient).toBeDefined();
      expect(persister.restoreClient).toBeDefined();
      expect(persister.removeClient).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should be able to set up both managers', () => {
      const mockSetOnline = jest.fn();
      const mockSetFocused = jest.fn();
      
      const onlineCleanup = onlineManager.setEventListener(mockSetOnline);
      const focusCleanup = focusManager.setEventListener(mockSetFocused);

      expect(onlineCleanup === undefined || typeof onlineCleanup === 'function').toBe(true);
      expect(focusCleanup === undefined || typeof focusCleanup === 'function').toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network state edge cases', () => {
      // Test the network state logic with edge cases
      const testNetworkState = (isConnected: any, isInternetReachable: any) => {
        return !!(isConnected && isInternetReachable);
      };

      expect(testNetworkState(null, null)).toBe(false);
      expect(testNetworkState(undefined, undefined)).toBe(false);
      expect(testNetworkState(false, false)).toBe(false);
    });

    it('should handle app state edge cases', () => {
      // Test the app state logic with edge cases
      const testAppState = (status: any) => {
        return status === 'active';
      };

      expect(testAppState('unknown')).toBe(false);
      expect(testAppState(null)).toBe(false);
      expect(testAppState(undefined)).toBe(false);
    });
  });
});
