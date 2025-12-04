import { deviceTokensAPI } from '@/api/deviceTokens';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string;
  notification: Notifications.Notification | undefined;
  isRegistered: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const { user, token: authToken } = useAuth()
  const registrationAttempted = useRef(false)

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch(error => {
        console.error('Failed to get push token:', error)
        setExpoPushToken(`${error}`)
      })

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification)
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response)
    });

    return () => {
      notificationListener.remove()
      responseListener.remove()
    };
  }, []);

  useEffect(() => {
    const registerTokenWithServer = async () => {
      if (!user || !authToken || !expoPushToken || registrationAttempted.current) {
        return
      }

      if (!expoPushToken.startsWith('ExponentPushToken')) return

      registrationAttempted.current = true

      try {
        const platform = Platform.OS as 'ios' | 'android'
        const deviceName = Device.designName ?? undefined
        const appVersion = Application.nativeApplicationVersion ?? undefined

        const response = await deviceTokensAPI.register({
          token: expoPushToken,
          platform,
          device_name: deviceName,
          app_version: appVersion
        })

        if (response.data) {
          console.log('Device token registered successfully:', response.data);
          setIsRegistered(true);
        } else if (response.error) {
          console.error('Failed to register device token:', response.error);
          // Reset so we can try again later
          registrationAttempted.current = false;
        }
      } catch (error) {
        console.error('Error registering device token:', error);
        registrationAttempted.current = false;
      }
    }

    registerTokenWithServer()
  }, [user, authToken, expoPushToken])

  // Reset registration state when user logs out
  useEffect(() => {
    if (!user) {
      registrationAttempted.current = false;
      setIsRegistered(false);
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, isRegistered }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
