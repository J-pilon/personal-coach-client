import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type PriorityOption = {
  label: string;
  value: number;
};

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { label: 'High', value: 1 },
  { label: 'Med', value: 2 },
  { label: 'Low', value: 3 },
];

type PriorityInputProps = {
  value: number;
  onChange: (priority: number) => void;
  options?: PriorityOption[];
  disabled?: boolean;
  showLabel?: boolean;
  label?: string;
  testID?: string;
};

export function PriorityInput({
  value,
  onChange,
  options = PRIORITY_OPTIONS,
  disabled = false,
  showLabel = false,
  label = 'Priority:',
  testID,
}: PriorityInputProps) {
  const content = (
    <View className="flex-row gap-2">
      {options.map((option) => (
        <Pressable
          key={`priority-${option.value}`}
          onPress={() => onChange(option.value)}
          className={`flex-1 py-3 px-4 rounded-lg border ${value === option.value
            ? 'border-cyan-400 bg-cyan-400'
            : 'border-[#708090] bg-[#13203a]'
            }`}
          disabled={disabled}
          testID={testID ? `${testID}-option-${option.value}` : undefined}
        >
          <Text
            className={`text-center font-medium capitalize ${value === option.value
              ? 'text-[#021A40]'
              : 'text-[#E6FAFF]'
              }`}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  if (showLabel) {
    return (
      <View className="mb-5" testID={testID}>
        <Text className="text-[#E6FAFF] text-base mb-3 font-medium">{label}</Text>
        {content}
      </View>
    );
  }

  return content;
}

