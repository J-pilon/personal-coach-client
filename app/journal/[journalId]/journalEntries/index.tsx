import { JournalEntry, JournalEntryFilters } from '@/api/journals';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/loading';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useJournalEntries } from '@/hooks/useJournal';
import { JournalEntryType } from '@/models/journal';
import { formatDateLabel, toIsoDate } from '@/utils/dateFormatters';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

const ENTRY_TYPE_LABELS: Record<JournalEntryType, string> = {
  daily_journal: 'Daily journal',
  weekly_reflection: 'Weekly reflection',
  general: 'General',
};

const ENTRY_TYPE_FILTERS: readonly { value: JournalEntryType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'daily_journal', label: 'Daily' },
  { value: 'weekly_reflection', label: 'Weekly' },
  { value: 'general', label: 'General' },
];

const TODAY_PROMPT_BY_WEEKDAY: Record<number, { kind: JournalEntryType; copy: string }> = {
  0: { kind: 'weekly_reflection', copy: "It's Sunday — take a moment to reflect on the week behind you." },
  1: { kind: 'daily_journal', copy: 'What is one thing you want to focus on today?' },
  2: { kind: 'daily_journal', copy: 'What progress did you make yesterday worth noticing?' },
  3: { kind: 'daily_journal', copy: 'Halfway through the week — what is going well?' },
  4: { kind: 'daily_journal', copy: 'What is the hardest thing on your plate right now?' },
  5: { kind: 'daily_journal', copy: 'Friday check-in: what is one win from this week?' },
  6: { kind: 'weekly_reflection', copy: 'Saturday is a great day to write a weekly reflection.' },
};

export default function JournalEntriesScreen() {
  return (
    <ErrorBoundary scope="journal-entries">
      <JournalEntriesContent />
    </ErrorBoundary>
  );
}

function JournalEntriesContent() {
  const { journalId } = useLocalSearchParams<{ journalId: string }>();

  const [entryTypeFilter, setEntryTypeFilter] = useState<JournalEntryType | 'all'>('all');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  const filters = useMemo<JournalEntryFilters>(() => {
    const next: JournalEntryFilters = {};
    if (entryTypeFilter !== 'all') next.entry_type = entryTypeFilter;
    if (startDate) next.start_date = startDate;
    if (endDate) next.end_date = endDate;
    return next;
  }, [entryTypeFilter, startDate, endDate]);

  const hasActiveFilters = entryTypeFilter !== 'all' || !!startDate || !!endDate;

  const { data: entries = [], isLoading, error, refetch } = useJournalEntries(filters);

  const startNewEntry = (entryType: JournalEntryType) => {
    router.push(`/journal/${journalId}/journalEntries/new?entry_type=${entryType}` as any);
  };

  const openEntryDetail = (entryId: number) => {
    router.push(`/journal/${journalId}/journalEntries/${entryId}` as any);
  };

  const onPickerChange = (which: 'start' | 'end') => (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setActivePicker(null);
    }
    if (event.type !== 'set' || !selected) {
      return;
    }
    if (which === 'start') {
      setStartDate(toIsoDate(selected));
    } else {
      setEndDate(toIsoDate(selected));
    }
  };

  const clearFilters = () => {
    setEntryTypeFilter('all');
    setStartDate(null);
    setEndDate(null);
  };

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
  const pickerInitialDate = (() => {
    const baseString = activePicker === 'end' ? endDate : startDate;
    const fromState = baseString ? new Date(baseString) : null;
    return fromState && !Number.isNaN(fromState.getTime()) ? fromState : new Date();
  })();

  return (
    <LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
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

        <View className="mb-6" testID="journal-home-filters">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[#E6FAFF] text-sm font-medium">Filters</Text>
            {hasActiveFilters ? (
              <Pressable onPress={clearFilters} testID="journal-home-filters-clear">
                <Text className="text-[#22d3ee] text-xs font-medium">Clear</Text>
              </Pressable>
            ) : null}
          </View>

          <View className="flex-row flex-wrap gap-2 mb-3">
            {ENTRY_TYPE_FILTERS.map(({ value, label }) => {
              const selected = entryTypeFilter === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setEntryTypeFilter(value)}
                  className={`py-2 px-3 rounded-lg border ${
                    selected ? 'border-cyan-400 bg-cyan-400' : 'border-[#708090] bg-[#13203a]'
                  }`}
                  testID={`journal-home-filter-type-${value}`}
                >
                  <Text className={`font-medium ${selected ? 'text-[#021A40]' : 'text-[#E6FAFF]'}`}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setActivePicker('start')}
              className="flex-1 py-2 px-3 rounded-lg border border-[#708090] bg-[#13203a]"
              testID="journal-home-filter-start-button"
            >
              <Text className="text-[#708090] text-xs uppercase tracking-wider mb-1">From</Text>
              <Text className="text-[#E6FAFF] font-medium" testID="journal-home-filter-start-value">
                {formatDateLabel(startDate)}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActivePicker('end')}
              className="flex-1 py-2 px-3 rounded-lg border border-[#708090] bg-[#13203a]"
              testID="journal-home-filter-end-button"
            >
              <Text className="text-[#708090] text-xs uppercase tracking-wider mb-1">To</Text>
              <Text className="text-[#E6FAFF] font-medium" testID="journal-home-filter-end-value">
                {formatDateLabel(endDate)}
              </Text>
            </Pressable>
          </View>

          {activePicker && (
            <DateTimePicker
              testID={`journal-home-filter-${activePicker}-picker`}
              value={pickerInitialDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickerChange(activePicker)}
            />
          )}
        </View>

        <Text className="text-[#E6FAFF] text-base font-semibold mb-3">
          {hasActiveFilters ? 'Filtered entries' : 'All entries'}
        </Text>

        {entries.length === 0 ? (
          <View className="rounded-2xl p-6 bg-[#13203a] border border-[#274B8E]" testID="journal-home-empty">
            <Text className="text-[#F1F5F9] text-base mb-1">
              {hasActiveFilters ? 'No entries match these filters' : 'No entries yet'}
            </Text>
            <Text className="text-[#708090] text-sm">
              {hasActiveFilters
                ? 'Try clearing filters or adjusting the date range.'
                : 'Tap a prompt above to write your first reflection.'}
            </Text>
          </View>
        ) : (
          <View className="gap-3" testID="journal-home-recent-list">
            {entries.map((entry) => (
              <JournalEntryRow key={entry.id} entry={entry} onPress={openEntryDetail} />
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function JournalEntryRow({
  entry,
  onPress,
}: {
  entry: JournalEntry;
  onPress: (entryId: number) => void;
}) {
  const preview = entry.body.length > 120 ? `${entry.body.slice(0, 120).trim()}…` : entry.body;

  return (
    <Pressable
      onPress={() => onPress(entry.id)}
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
    </Pressable>
  );
}
