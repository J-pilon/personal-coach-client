import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';

interface BackButtonProps {
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

export default function BackButton({
  label,
  onPress,
  accessibilityLabel = 'Go back',
  testID = 'back-button',
}: BackButtonProps) {
  const hasLabel = Boolean(label?.trim());

  return (
    <Pressable
      onPress={onPress}
      className={`ml-2 h-10 flex-row items-center justify-center rounded-full border ${
        hasLabel ? 'px-3' : 'w-10'
      }`}
      style={{
        borderColor: Colors.accent.primary,
        backgroundColor: 'rgba(2, 26, 64, 0.35)',
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Ionicons name="arrow-back" size={24} color="#33CFFF" />
      {label && (
        <View className="ml-1">
          <Text className="text-sm font-semibold" style={{ color: Colors.accent.primary }} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
