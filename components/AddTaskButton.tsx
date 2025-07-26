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
      testID='add-task-button-button'
      onPress={handlePress}
      className="absolute right-6 bottom-28 z-50 justify-center items-center w-16 h-16 bg-cyan-400 rounded-full shadow-lg"
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