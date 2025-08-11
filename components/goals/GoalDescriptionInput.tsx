import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface GoalDescriptionInputProps {
  value: string;
  headerText?: string;
  inputPlaceholderText?: string;
  onChangeText: (text: string) => void;
  testID?: string;
}

export const GoalDescriptionInput = ({
  value,
  headerText: headerTextProp = 'What do you want to achieve?',
  inputPlaceholderText: headerPlaceholderTextProp = 'Describe your goal in detail...',
  onChangeText,
  testID: testIDProp = 'goal-description-input'
}: GoalDescriptionInputProps) => {
  return (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-[#F1F5F9] mb-3">
        {headerTextProp}
      </Text>
      <View
        className="bg-[#2B42B6] rounded-2xl p-4 border border-[#33CFFF]"
        style={{
          shadowColor: '#274B8E',
          shadowOpacity: 0.10,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 3 }
        }}
      >
        <TextInput
          className="text-[#F1F5F9] text-base"
          placeholder=""
          placeholderTextColor={headerPlaceholderTextProp}
          value={value}
          onChangeText={onChangeText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID={testIDProp}
        />
      </View>
    </View>
  );
};
