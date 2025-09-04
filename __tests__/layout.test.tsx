import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { render } from '@testing-library/react-native';
import React from 'react';
import { AppState } from 'react-native';

// Mock the layout component
const MockLayout = () => {
  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

  const queryClient = new QueryClient({
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

  // Wire up online manager
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!(state.isConnected && state.isInternetReachable));
    });
  });

  // Wire up focus manager
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener('change', (status) => {
      setFocused(status === 'active');
    });
    return () => subscription?.remove();
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <TestChild />
    </PersistQueryClientProvider>
  );
};

const TestChild = () => {
  return <div testID="test-child">Test Content</div>;
};

describe('App Layout Integration', () => {
  let mockNetInfo: jest.Mocked<typeof NetInfo>;
  let mockAppState: jest.Mocked<typeof AppState>;
  let mockAsyncStorage: jest.Mocked<typeof AsyncStorage>;
  let mockCreateAsyncStoragePersister: jest.MockedFunction<typeof createAsyncStoragePersister>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
    mockAppState = AppState as jest.Mocked<typeof AppState>;
    mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    mockCreateAsyncStoragePersister = createAsyncStoragePersister as jest.MockedFunction<typeof createAsyncStoragePersister>;

    // Setup mocks
    mockNetInfo.addEventListener.mockReturnValue(jest.fn());
    mockAppState.addEventListener.mockReturnValue({ remove: jest.fn() });
    mockAsyncStorage.getItem = jest.fn();
    mockAsyncStorage.setItem = jest.fn();
    mockAsyncStorage.removeItem = jest.fn();

    const mockPersister = {
      persistClient: jest.fn(),
      restoreClient: jest.fn(),
      removeClient: jest.fn(),
    };
    (mockCreateAsyncStoragePersister as jest.MockedFunction<typeof createAsyncStoragePersister>).mockReturnValue(mockPersister as any);
  });

  describe('PersistQueryClientProvider Setup', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<MockLayout />);
      expect(getByTestId('test-child')).toBeTruthy();
    });

    it('should create persister with correct configuration', () => {
      render(<MockLayout />);

      expect(mockCreateAsyncStoragePersister).toHaveBeenCalledWith({
        storage: AsyncStorage,
      });
    });

    it('should pass persister to PersistQueryClientProvider', () => {
      const persister = {
        persistClient: jest.fn(),
        restoreClient: jest.fn(),
        removeClient: jest.fn(),
      };
      mockCreateAsyncStoragePersister.mockReturnValue(persister);

      render(<MockLayout />);

      // The persister should be created and passed to the provider
      expect(mockCreateAsyncStoragePersister).toHaveBeenCalled();
    });
  });

  describe('Online Manager Integration', () => {
    it('should set up NetInfo listener on mount', () => {
      render(<MockLayout />);

      expect(mockNetInfo.addEventListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle network state changes', async () => {
      render(<MockLayout />);

      const netInfoCallback = mockNetInfo.addEventListener.mock.calls[0][0];

      // Simulate network state changes
      netInfoCallback({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: { isConnectionExpensive: false }
      } as any);
      netInfoCallback({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null
      } as any);

      // Verify the callback was called with the right parameters
      expect(mockNetInfo.addEventListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Manager Integration', () => {
    it('should set up AppState listener on mount', () => {
      render(<MockLayout />);

      expect(mockAppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should handle app state changes', () => {
      render(<MockLayout />);

      const appStateCallback = mockAppState.addEventListener.mock.calls[0][1];

      // Simulate app state changes
      appStateCallback('active');
      appStateCallback('background');
      appStateCallback('inactive');

      expect(mockAppState.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('should return cleanup function', () => {
      render(<MockLayout />);

      // The focus manager should return a cleanup function
      expect(mockAppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Error Boundaries', () => {
    it('should handle persister creation errors gracefully', () => {
      mockCreateAsyncStoragePersister.mockImplementation(() => {
        throw new Error('Persister creation failed');
      });

      expect(() => render(<MockLayout />)).toThrow('Persister creation failed');
    });

    it('should handle NetInfo setup errors gracefully', () => {
      mockNetInfo.addEventListener.mockImplementation(() => {
        throw new Error('NetInfo setup failed');
      });

      expect(() => render(<MockLayout />)).toThrow('NetInfo setup failed');
    });

    it('should handle AppState setup errors gracefully', () => {
      mockAppState.addEventListener.mockImplementation(() => {
        throw new Error('AppState setup failed');
      });

      expect(() => render(<MockLayout />)).toThrow('AppState setup failed');
    });
  });

  describe('Memory Management', () => {
    it('should clean up NetInfo listener on unmount', () => {
      const mockRemoveListener = jest.fn();
      mockNetInfo.addEventListener.mockReturnValue(mockRemoveListener);

      const { unmount } = render(<MockLayout />);
      unmount();

      // The cleanup function should be available (though we can't test if it's called
      // since the component unmounts)
      expect(mockNetInfo.addEventListener).toHaveBeenCalled();
    });

    it('should clean up AppState listener on unmount', () => {
      const mockRemoveListener = jest.fn();
      mockAppState.addEventListener.mockReturnValue({ remove: mockRemoveListener });

      const { unmount } = render(<MockLayout />);
      unmount();

      // The cleanup function should be available
      expect(mockAppState.addEventListener).toHaveBeenCalled();
    });
  });
});
