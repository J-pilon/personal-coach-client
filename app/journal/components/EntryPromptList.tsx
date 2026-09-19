import type { JournalEntryType } from '@/models/journal';
import React from 'react';
import { Text, View } from 'react-native';

const PROMPTS_BY_ENTRY_TYPE: Record<JournalEntryType, readonly string[]> = {
  daily_journal: [
    'What progress did I make today?',
    'What felt hard?',
    'What is one thing I can improve tomorrow?',
  ],
  weekly_reflection: [
    'What worked this week?',
    'What did not work?',
    'What should I adjust next week?',
  ],
  general: [],
};

export interface EntryPromptListProps {
  entryType: JournalEntryType;
  testID?: string;
}

export function EntryPromptList({
  entryType,
  testID = 'journal-form-prompts',
}: EntryPromptListProps) {
  const prompts = PROMPTS_BY_ENTRY_TYPE[entryType];

  if (prompts.length === 0) return null;

  return (
    <View
      className="rounded-2xl p-4 bg-surface-input border border-border-strong"
      testID={testID}
    >
      <Text className="text-accent text-xs uppercase tracking-wider mb-2">Prompts</Text>
      {prompts.map((prompt) => (
        <Text key={prompt} className="text-ink-secondary text-sm leading-5 mb-1">
          • {prompt}
        </Text>
      ))}
    </View>
  );
}
