import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProfile } from '@/hooks/useUser';
import { isOnboardingSkippable } from '@/utils/handleSkipOnboarding';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { data: profile, isLoading } = useProfile();

  useEffect(() => {
    const checkOnboarding = async () => {
      const skipOnboarding = await isOnboardingSkippable();

      if (!isLoading && profile && profile.onboarding_status === 'incomplete') {
        if (skipOnboarding) {
          router.replace('/(tabs)');
          return;
        }

        router.replace('/onboarding');
      }
    };

    checkOnboarding();
  }, [profile, isLoading]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome5 name="tasks" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="todaysFocus"
        options={{
          headerShown: false,
          title: "Today's Focus",
          tabBarIcon: ({ color }) => <Ionicons name="compass" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="menu" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
