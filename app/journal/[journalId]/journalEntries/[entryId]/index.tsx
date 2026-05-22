import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/loading';
import { useToast } from '@/components/ToastManager';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useDeleteJournalEntry, useJournalEntry } from '@/hooks/useJournal';
import { JournalEntryType } from '@/models/journal';
import { formatLongDate } from '@/utils/dateFormatters';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

const ENTRY_TYPE_LABELS: Record<JournalEntryType, string> = {
  daily_journal: 'Daily journal',
  weekly_reflection: 'Weekly reflection',
  general: 'General',
};

export default function JournalEntryDetailScreen() {
  return (
    <ErrorBoundary scope="journal-entry-detail">
      <JournalEntryDetailContent />
    </ErrorBoundary>
  );
}

function JournalEntryDetailContent() {
  const { journalId, entryId: rawEntryId } = useLocalSearchParams<{
    journalId: string;
    entryId: string;
  }>();
  const entryId = parseInt(rawEntryId || '0', 10);

  const { data: entry, isLoading, error, refetch } = useJournalEntry(entryId);
  const deleteMutation = useDeleteJournalEntry();
  const toast = useToast();

  const handleEdit = () => {
    router.push(`/journal/${journalId}/journalEntries/${entryId}/edit` as any);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(entryId, {
              onSuccess: () => {
                router.back();
              },
              onError: (mutationError) => {
                const message =
                  mutationError instanceof Error ? mutationError.message : 'Could not delete the entry';
                toast.error(message);
              },
            });
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <LinearGradient>
        <LoadingSpinner
          size="large"
          text="Loading entry..."
          variant="fullscreen"
          testID="journal-entry-detail-loading"
        />
      </LinearGradient>
    );
  }

  if (error || !entry) {
    return (
      <LinearGradient>
        <View className="flex-1 justify-center px-6">
          <Text
            className="text-[#F1F5F9] text-lg text-center mb-2"
            testID="journal-entry-detail-error-title"
          >
            Could not load this entry
          </Text>
          <Text
            className="text-[#E6FAFF] text-center mb-6"
            testID="journal-entry-detail-error-message"
          >
            {error instanceof Error ? error.message : 'Entry not found'}
          </Text>
          <View className="flex-row gap-3 self-center">
            <Pressable
              onPress={() => refetch()}
              className="px-6 py-3 bg-cyan-400 rounded-lg"
              testID="journal-entry-detail-retry-button"
            >
              <Text className="text-[#021A40] font-semibold">Retry</Text>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              className="border border-[#708090] px-6 py-3 rounded-lg"
              testID="journal-entry-detail-back-button"
            >
              <Text className="text-[#E6FAFF] font-semibold">Back</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="flex-row justify-end gap-3 mb-6">
          <Pressable
            onPress={handleEdit}
            className="px-4 py-2 rounded-lg border border-[#33CFFF]"
            testID="journal-entry-detail-edit-button"
          >
            <Text className="text-[#33CFFF] font-medium">Edit</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            className="px-4 py-2 rounded-lg border border-red-500"
            disabled={deleteMutation.isPending}
            testID="journal-entry-detail-delete-button"
          >
            <Text className="text-red-500 font-medium">
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Text
            className="text-[#22d3ee] text-xs uppercase tracking-wider"
            testID="journal-entry-detail-entry-type"
          >
            {ENTRY_TYPE_LABELS[entry.entry_type]}
          </Text>
          <Text className="text-[#708090] text-xs" testID="journal-entry-detail-occurred-on">
            {formatLongDate(entry.occurred_on)}
          </Text>
        </View>

        {entry.title ? (
          <Text
            className="text-[#F1F5F9] text-2xl font-semibold mb-4"
            testID="journal-entry-detail-title"
          >
            {entry.title}
          </Text>
        ) : null}

        <View
          className="rounded-2xl p-5 bg-[#2B42B6] border border-[#274B8E]"
          testID="journal-entry-detail-body-container"
        >
          <Text
            className="text-[#F1F5F9] text-base leading-6"
            testID="journal-entry-detail-body"
          >
            {entry.body}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
