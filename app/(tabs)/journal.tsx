import { JournalEntry } from '@/api/journals';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/loading';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useJournalEntries } from '@/hooks/useJournal';
import { JournalEntryType } from '@/models/journal';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const ENTRY_TYPE_LABELS: Record<JournalEntryType, string> = {
  daily_journal: 'Daily journal',
  weekly_reflection: 'Weekly reflection',
  general: 'General',
};

const TODAY_PROMPT_BY_WEEKDAY: Record<number, { kind: JournalEntryType; copy: string }> = {
  0: { kind: 'weekly_reflection', copy: "It's Sunday — take a moment to reflect on the week behind you." },
  1: { kind: 'daily_journal', copy: 'What is one thing you want to focus on today?' },
  2: { kind: 'daily_journal', copy: 'What progress did you make yesterday worth noticing?' },
  3: { kind: 'daily_journal', copy: 'Halfway through the week — what is going well?' },
  4: { kind: 'daily_journal', copy: 'What is the hardest thing on your plate right now?' },
  5: { kind: 'daily_journal', copy: 'Friday check-in: what is one win from this week?' },
  6: { kind: 'weekly_reflection', copy: 'Saturday is a great day to write a weekly reflection.' },
};

const startNewEntry = (entryType: JournalEntryType) => {
  router.push(`/journal/new?entry_type=${entryType}` as any);
};

export default function JournalScreen() {
  return (
    <ErrorBoundary scope="journal-home">
      <JournalHomeContent />
    </ErrorBoundary>
  );
}

function JournalHomeContent() {
  const { data: entries = [], isLoading, error, refetch } = useJournalEntries();

  if (isLoading) {
    return (
      <LinearGradient>
        <LoadingSpinner size="large" text="Loading journal..." variant="fullscreen" testID="journal-home-loading" />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient>
        <View className="flex-1 justify-center px-6">
          <Text className="text-[#F1F5F9] text-lg text-center mb-2" testID="journal-home-error-title">
            Could not load your journal
          </Text>
          <Text className="text-[#E6FAFF] text-center mb-6" testID="journal-home-error-message">
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
          <Pressable onPress={() => refetch()} className="bg-[#154FA6] px-6 py-3 rounded-lg self-center">
            <Text className="text-[#021A40] font-semibold">Retry</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  const prompt = TODAY_PROMPT_BY_WEEKDAY[new Date().getDay()];
  const recentEntries = entries.slice(0, 5);

  return (
    <LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text
          className="text-[28px] font-semibold mb-6 text-center text-[#F1F5F9] tracking-wide"
          testID="journal-home-title"
        >
          Journal
        </Text>

        <View
          className="rounded-2xl p-5 mb-6 bg-[#2B42B6] border border-[#274B8E]"
          testID="journal-home-prompt"
        >
          <Text className="text-[#22d3ee] text-xs uppercase tracking-wider mb-2">Today&apos;s prompt</Text>
          <Text className="text-[#F1F5F9] text-base leading-6">{prompt.copy}</Text>
        </View>

        <View className="gap-3 mb-8">
          <Pressable
            onPress={() => startNewEntry('daily_journal')}
            className="rounded-2xl p-4 bg-[#154FA6] flex-row items-center"
            testID="journal-home-cta-daily"
          >
            <Ionicons name="sunny-outline" size={22} color="#22d3ee" />
            <Text className="text-[#F1F5F9] text-base font-semibold ml-3">Write daily journal</Text>
          </Pressable>

          <Pressable
            onPress={() => startNewEntry('weekly_reflection')}
            className="rounded-2xl p-4 bg-[#13203a] border border-[#274B8E] flex-row items-center"
            testID="journal-home-cta-weekly"
          >
            <Ionicons name="calendar-outline" size={22} color="#22d3ee" />
            <Text className="text-[#F1F5F9] text-base font-semibold ml-3">Weekly reflection</Text>
          </Pressable>
        </View>

        <Text className="text-[#E6FAFF] text-base font-semibold mb-3">Recent entries</Text>

        {recentEntries.length === 0 ? (
          <View className="rounded-2xl p-6 bg-[#13203a] border border-[#274B8E]" testID="journal-home-empty">
            <Text className="text-[#F1F5F9] text-base mb-1">No entries yet</Text>
            <Text className="text-[#708090] text-sm">Tap a prompt above to write your first reflection.</Text>
          </View>
        ) : (
          <View className="gap-3" testID="journal-home-recent-list">
            {recentEntries.map((entry) => (
              <JournalEntryRow key={entry.id} entry={entry} />
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function JournalEntryRow({ entry }: { entry: JournalEntry }) {
  const preview = entry.body.length > 120 ? `${entry.body.slice(0, 120).trim()}…` : entry.body;

  return (
    <View
      className="rounded-2xl p-4 bg-[#2B42B6] border border-[#274B8E]"
      testID={`journal-entry-row-${entry.id}`}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-[#22d3ee] text-xs uppercase tracking-wider">
          {ENTRY_TYPE_LABELS[entry.entry_type]}
        </Text>
        <Text className="text-[#708090] text-xs">{entry.occurred_on}</Text>
      </View>
      {entry.title ? (
        <Text className="text-[#F1F5F9] text-base font-semibold mb-1">{entry.title}</Text>
      ) : null}
      <Text className="text-[#E6FAFF] text-sm leading-5">{preview}</Text>
    </View>
  );
}
