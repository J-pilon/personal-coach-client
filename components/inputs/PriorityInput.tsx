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
            ? 'border-accent bg-accent'
            : 'border-border-muted bg-surface-input'
            }`}
          disabled={disabled}
          testID={testID ? `${testID}-option-${option.value}` : undefined}
        >
          <Text
            className={`text-center font-medium capitalize ${value === option.value
              ? 'text-ink-onAccent'
              : 'text-ink-secondary'
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
        <Text className="text-ink-secondary text-base mb-3 font-medium">{label}</Text>
        {content}
      </View>
    );
  }

  return content;
}

