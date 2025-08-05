import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from '@/components/ui/LinearGradient';
import { useAuth } from '@/hooks/useAuth';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function MenuScreen() {
  const { signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      onPress: () => {
        router.push('/profile');
      },
    },
    {
      id: 'smart-goals',
      title: 'Goals',
      icon: 'star-outline',
      onPress: () => {
        router.push('/smartGoals');
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      onPress: () => {
        // TODO: Navigate to settings screen
        console.log('Settings pressed');
      },
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => {
        // TODO: Navigate to help screen
        console.log('Help pressed');
      },
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => {
        // TODO: Navigate to about screen
        console.log('About pressed');
      },
    },
    {
      id: 'logout',
      title: 'Sign Out',
      icon: 'log-out-outline',
      onPress: handleLogout,
    },
  ];

  return (
    <LinearGradient>
      <View className="flex-1 p-6">
        <Text className="text-[28px] font-semibold text-center text-[#F1F5F9] mb-8 tracking-wide" testID="menu-title">Menu</Text>

        <View className="gap-4">
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              className={`rounded-2xl p-5 shadow-lg border ${item.id === 'logout' ? 'bg-red-600' : 'bg-[#2B42B6]'
                }`}
              style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}
              onPress={item.onPress}
              testID={`menu-item-${item.id}`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row flex-1 items-center">
                  <View className={`rounded-xl p-3 mr-4 ${item.id === 'logout' ? 'bg-red-700' : 'bg-[#154FA6]'
                    }`}>
                    <Ionicons name={item.icon} size={24} color="#021A40" />
                  </View>
                  <Text className="text-[#F1F5F9] text-lg font-semibold" testID={`menu-item-text-${item.id}`}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#E6FAFF" />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
} 