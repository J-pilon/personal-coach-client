import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
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
                headerBackTitle: "Menu"
              }} />
            <Stack.Screen
              name="addTask/index"
              options={{
                headerShown: true,
                headerTitle: "New Task",
                headerBackTitle: "Tasks"
              }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
