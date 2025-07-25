import React from 'react';
import { Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

interface AddTaskButtonProps {
  onPress?: () => void;
}

export default function AddTaskButton({ onPress }: AddTaskButtonProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/addTask');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-[#33CFFF] to-[#274B8E] items-center justify-center shadow-lg"
      style={{
        shadowColor: '#33CFFF',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      }}
    >
      <FontAwesome name="plus" size={20} color="#021A40" />
    </Pressable>
  );
} 