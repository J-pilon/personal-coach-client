import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function MenuScreen() {
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
      id: 'smart goals',
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
  ];

  return (
    <View className="flex-1 bg-[#021A40] p-6">
      <Text className="text-[28px] font-semibold text-center text-[#F1F5F9] mb-8 tracking-wide">Menu</Text>

      <View className="space-y-4">
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            className="bg-[#13203a] rounded-2xl p-5 shadow-lg border border-[#33CFFF]"
            onPress={item.onPress}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-[#33CFFF] rounded-xl p-3 mr-4">
                  <Ionicons name={item.icon} size={24} color="#021A40" />
                </View>
                <Text className="text-[#F1F5F9] text-lg font-semibold">
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#E6FAFF" />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
} 