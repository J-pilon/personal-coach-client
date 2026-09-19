import type { JournalEntryType } from '@/models/journal';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export const ENTRY_TYPES: readonly { value: JournalEntryType; label: string }[] = [
  { value: 'daily_journal', label: 'Daily' },
  { value: 'weekly_reflection', label: 'Weekly' },
  { value: 'general', label: 'General' },
];

export interface EntryTypeSelectorProps {
  value: JournalEntryType;
  onChange: (next: JournalEntryType) => void;
  disabled?: boolean;
  testIDPrefix?: string;
}

export function EntryTypeSelector({
  value,
  onChange,
  disabled = false,
  testIDPrefix = 'journal-form-entry-type',
}: EntryTypeSelectorProps) {
  return (
    <View>
      <Text className="text-ink-secondary text-sm mb-2 font-medium">Entry type</Text>
      <View className="flex-row gap-2">
        {ENTRY_TYPES.map(({ value: optionValue, label }) => {
          const selected = value === optionValue;
          return (
            <Pressable
              key={optionValue}
              onPress={() => onChange(optionValue)}
              className={`flex-1 py-2 px-3 rounded-lg border ${
                selected ? 'border-accent bg-accent' : 'border-border-muted bg-surface-input'
              }`}
              disabled={disabled}
              testID={`${testIDPrefix}-${optionValue}`}
            >
              <Text
                className={`text-center font-medium ${
                  selected ? 'text-ink-onAccent' : 'text-ink-secondary'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
