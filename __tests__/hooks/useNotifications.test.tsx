import { renderHook, waitFor } from '@testing-library/react-native';
import React, { ReactNode } from 'react';

import * as Notifications from 'expo-notifications';
import { deviceTokensAPI } from '../../api/deviceTokens';
import { useAuth } from '../../hooks/useAuth';
import { NotificationProvider, useNotifications } from '../../hooks/useNotifications';
import { registerForPushNotificationsAsync } from '../../utils/notifications';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  designName: 'Test Device',
}));

// Mock expo-application
jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
}));

// Mock registerForPushNotificationsAsync
jest.mock('../../utils/notifications', () => ({
  registerForPushNotificationsAsync: jest.fn(),
}));

// Mock deviceTokensAPI
jest.mock('../../api/deviceTokens', () => ({
  deviceTokensAPI: {
    register: jest.fn(),
  },
}));

// Mock useAuth
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockRegisterForPushNotificationsAsync = registerForPushNotificationsAsync as jest.Mock;
const mockRegister = deviceTokensAPI.register as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

describe('useNotifications', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, token: null });
    mockRegisterForPushNotificationsAsync.mockResolvedValue(undefined);
  });

  describe('NotificationProvider', () => {
    it('registers for push notifications on mount', async () => {
      mockRegisterForPushNotificationsAsync.mockResolvedValue('ExponentPushToken[test123]');

      renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(mockRegisterForPushNotificationsAsync).toHaveBeenCalled();
      });
    });

    it('sets up notification listeners on mount', () => {
      renderHook(() => useNotifications(), { wrapper });

      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    });
  });

  describe('server registration', () => {
    it('registers token with server when user and token are available', async () => {
      mockRegisterForPushNotificationsAsync.mockResolvedValue('ExponentPushToken[test123]');
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        token: 'auth-token-123',
      });
      mockRegister.mockResolvedValue({
        data: { message: 'Success', device_token: { id: 1, platform: 'ios', active: true } },
      });

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
        expect(result.current.isRegistered).toBe(true);
      });
    });

    it('does not register with server if no user', async () => {
      mockRegisterForPushNotificationsAsync.mockResolvedValue('ExponentPushToken[test123]');
      mockUseAuth.mockReturnValue({ user: null, token: null });

      renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(mockRegisterForPushNotificationsAsync).toHaveBeenCalled();
      });

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('does not register invalid tokens (non-Expo format)', async () => {
      mockRegisterForPushNotificationsAsync.mockResolvedValue('invalid-token');
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        token: 'auth-token-123',
      });

      renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(mockRegisterForPushNotificationsAsync).toHaveBeenCalled();
      });

      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('context values', () => {
    it('provides expoPushToken from registration', async () => {
      mockRegisterForPushNotificationsAsync.mockResolvedValue('ExponentPushToken[abc]');

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.expoPushToken).toBe('ExponentPushToken[abc]');
      });
    });

    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useNotifications());
      }).toThrow('useNotifications must be used within a NotificationProvider');
    });
  });
});

