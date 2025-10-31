import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import '../global.css';

import SplashScreen from '@/components/SplashScreen';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
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
  const { user, isLoading } = useAuth();

  // Navigation logic - redirect based on authentication state
  useEffect(() => {
    if (!isLoading && !showSplash) {
      if (user) {
        // User is authenticated, redirect to main app
        router.replace('/(tabs)');
      } else {
        // User is not authenticated, redirect to login
        router.replace('/auth/login');
      }
    }
  }, [user, isLoading, showSplash]);

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
          <Stack>
            {/* Define all screens at layout level */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
            <Stack.Screen
              name="profile/index"
              options={{
                headerShown: true,
                headerTitle: "Profile",
                headerBackTitle: "Menu"
              }} />
            <Stack.Screen
              name="smartGoals/index"
              options={{
                headerShown: true,
                headerTitle: "Goals",
                headerBackTitle: "Menu"
              }} />
            <Stack.Screen
              name="taskDetail/[id]"
              options={{
                headerShown: true,
                headerTitle: "Task Details",
                headerBackTitle: "Tasks"
              }} />
            <Stack.Screen
              name="addTask/index"
              options={{
                headerShown: true,
                headerTitle: "New Task",
                headerBackTitle: "Tasks"
              }} />
            <Stack.Screen
              name="about/index"
              options={{
                headerShown: true,
                headerTitle: "How to Use",
                headerBackTitle: "Menu"
              }} />
            <Stack.Screen
              name="support-feedback/index"
              options={{
                headerShown: true,
                headerTitle: "Support & Feedback",
                headerBackTitle: "Menu"
              }} />
            <Stack.Screen
              name="settings/index"
              options={{
                headerShown: true,
                headerTitle: "Settings",
                headerBackTitle: "Menu"
              }} />
            <Stack.Screen
              name="addGoal/index"
              options={{
                headerShown: true,
                headerTitle: "New Goal",
                headerBackTitle: "SMART Goals"
              }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
