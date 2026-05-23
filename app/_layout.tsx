import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import '../global.css';

import { BackButton } from '@/components/buttons';
import SplashScreen from '@/components/SplashScreen';
import { ToastProvider } from '@/components/ToastManager';
import ScreenHeader from '@/components/ui/screenHeader/ScreenHeader';
import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NotificationProvider } from '@/hooks/useNotifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
    },
  },
});

function AppContent() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const { user, profile, isLoading } = useAuth();

  // Navigation logic - redirect based on authentication state
  useEffect(() => {
    if (!isLoading && !showSplash) {
      if (user && profile) {
        // User is authenticated, redirect to main app
        router.replace('/(tabs)');
      } else {
        // User is not authenticated, redirect to login
        router.replace('/auth/login');
      }
    }
  }, [user, profile, isLoading, showSplash]);

  if (!loaded) {
    return null;
  }

  // Show splash screen until user clicks "Let's Get Started!"
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // After splash is dismissed, show loading while checking auth
  if (isLoading) {
    return <SplashScreen onFinish={() => { }} />;
  }

  // Once auth is loaded, show the main app structure
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaView
          style={{ flex: 1 }}
          edges={Platform.OS === 'android'
            ? ["top", "left", "right"]
            : ["top", "left", "right"]
          }
        >
          <ToastProvider>
            <Stack
              screenOptions={{
                header: ({ navigation, options }) => {
                  const title = typeof options.headerTitle === 'string'
                    ? options.headerTitle
                    : typeof options.title === 'string'
                      ? options.title
                      : '';

                  if (title === 'Menu') {
                    return null;
                  }

                  return (
                    <ScreenHeader
                      title={title}
                      backButton={
                        navigation.canGoBack() || title === 'Entries' ? (
                          <BackButton
                            onPress={() => {
                              if (navigation.canGoBack()) {
                                navigation.goBack();
                                return;
                              }

                              router.replace('/(tabs)');
                            }}
                          />
                        ) : null
                      }
                      style={{
                        backgroundColor: Colors.background.secondary,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(51, 207, 255, 0.18)',
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.16,
                        shadowRadius: 10,
                        elevation: 4,
                      }}
                    />
                  );
                },
              }}

            >
              {/* Define all screens at layout level */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
              <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="auth/password-reset-confirm" options={{ headerShown: false }} />
              <Stack.Screen
                name="profile/index"
                options={{
                  headerShown: true,
                  headerTitle: "Profile",
                }} />
              <Stack.Screen
                name="smartGoals/index"
                options={{
                  headerShown: true,
                  headerTitle: "My Smart Goals",
                }} />
              <Stack.Screen
                name="smartGoals/[id]"
                options={{
                  headerShown: true,
                  headerTitle: "Goal Details",
                }} />
              <Stack.Screen
                name="taskDetail/[id]"
                options={{
                  headerShown: true,
                  headerTitle: "Task Details",
                }} />
              <Stack.Screen
                name="addTask/index"
                options={{
                  headerShown: true,
                  headerTitle: "New Task",
                }} />
              <Stack.Screen
                name="about/index"
                options={{
                  headerShown: true,
                  headerTitle: "How to Use",
                }} />
              <Stack.Screen
                name="support-feedback/index"
                options={{
                  headerShown: true,
                  headerTitle: "Support & Feedback",
                }} />
              <Stack.Screen
                name="settings/index"
                options={{
                  headerShown: true,
                  headerTitle: "Settings",
                }} />
              <Stack.Screen
                name="addGoal/index"
                options={{
                  headerShown: true,
                  headerTitle: "New Goal",
                }} />
              <Stack.Screen
                name="journal/[journalId]/journalEntries/index"
                options={{
                  headerShown: true,
                  headerTitle: "Entries"
                }} />
              <Stack.Screen
                name="journal/[journalId]/journalEntries/[entryId]/index"
                options={{
                  headerShown: true,
                  headerTitle: "Entry Details",
                }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ToastProvider>
        </SafeAreaView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
