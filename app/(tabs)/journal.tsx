import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/loading';
import LinearGradient from '@/components/ui/LinearGradient';
import { useJournal } from '@/hooks/useJournal';
import { Redirect, router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function JournalTabScreen() {
  return (
    <ErrorBoundary scope="journal-tab">
      <JournalTabContent />
    </ErrorBoundary>
  );
}

function JournalTabContent() {
  const { data: journal, isLoading, error, refetch } = useJournal();

  if (isLoading) {
    return (
      <LinearGradient>
        <LoadingSpinner
          size="large"
          text="Loading journal..."
          variant="fullscreen"
          testID="journal-tab-loading"
        />
      </LinearGradient>
    );
  }

  if (error || !journal) {
    return (
      <LinearGradient>
        <View className="flex-1 justify-center px-6">
          <Text className="text-[#F1F5F9] text-lg text-center mb-2" testID="journal-tab-error-title">
            Could not load your journal
          </Text>
          <Text className="text-[#E6FAFF] text-center mb-6" testID="journal-tab-error-message">
            {error instanceof Error ? error.message : 'Journal not available'}
          </Text>
          <View className="flex-row gap-3 self-center">
            <Pressable
              onPress={() => refetch()}
              className="bg-[#154FA6] px-6 py-3 rounded-lg"
              testID="journal-tab-retry-button"
            >
              <Text className="text-[#021A40] font-semibold">Retry</Text>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              className="border border-[#708090] px-6 py-3 rounded-lg"
              testID="journal-tab-back-button"
            >
              <Text className="text-[#E6FAFF] font-semibold">Back</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return <Redirect href={`/journal/${journal.id}/journalEntries` as any} />;
}
