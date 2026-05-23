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
      <Text className="text-[#E6FAFF] text-sm mb-2 font-medium">Entry type</Text>
      <View className="flex-row gap-2">
        {ENTRY_TYPES.map(({ value: optionValue, label }) => {
          const selected = value === optionValue;
          return (
            <Pressable
              key={optionValue}
              onPress={() => onChange(optionValue)}
              className={`flex-1 py-2 px-3 rounded-lg border ${
                selected ? 'border-cyan-400 bg-cyan-400' : 'border-[#708090] bg-[#13203a]'
              }`}
              disabled={disabled}
              testID={`${testIDPrefix}-${optionValue}`}
            >
              <Text
                className={`text-center font-medium ${
                  selected ? 'text-[#021A40]' : 'text-[#E6FAFF]'
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
