import { UpdateJournalEntryParams } from '@/api/journals';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/loading';
import { useToast } from '@/components/ToastManager';
import LinearGradient from '@/components/ui/LinearGradient';
import { useJournalEntry, useUpdateJournalEntry } from '@/hooks/useJournal';
import type { JournalEntryFormValues } from '@/models/journal';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { JournalEntryForm } from '@/app/journal/components/JournalEntryForm';

const parseEntryId = (raw: unknown): number => {
  if (typeof raw !== 'string') return 0;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export default function EditJournalEntryScreen() {
  return (
    <ErrorBoundary scope="journal-edit-entry">
      <EditJournalEntryContent />
    </ErrorBoundary>
  );
}

function EditJournalEntryContent() {
  const toast = useToast();
  const updateMutation = useUpdateJournalEntry();

  const { entryId: rawEntryId } = useLocalSearchParams<{ entryId?: string }>();
  const entryId = parseEntryId(rawEntryId);

  const {
    data: existingEntry,
    isLoading,
    error,
  } = useJournalEntry(entryId);

  const initialValues = useMemo<JournalEntryFormValues | null>(() => {
    if (!existingEntry) return null;
    return {
      title: existingEntry.title ?? '',
      body: existingEntry.body,
      entry_type: existingEntry.entry_type,
      occurred_on: existingEntry.occurred_on,
    };
  }, [existingEntry]);

  if (isLoading && !existingEntry) {
    return (
      <LinearGradient>
        <LoadingSpinner
          size="large"
          text="Loading entry..."
          variant="fullscreen"
          testID="journal-form-loading"
        />
      </LinearGradient>
    );
  }

  if (error || !initialValues) {
    return (
      <LinearGradient>
        <View className="flex-1 justify-center px-6">
          <Text className="text-[#F1F5F9] text-lg text-center mb-2" testID="journal-form-error-title">
            Could not load this entry
          </Text>
          <Text className="text-[#E6FAFF] text-center mb-6" testID="journal-form-error-message">
            {error instanceof Error ? error.message : 'Entry not found'}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="border border-[#708090] px-6 py-3 rounded-lg self-center"
            testID="journal-form-error-back-button"
          >
            <Text className="text-[#E6FAFF] font-semibold">Back</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  const onSubmit = (values: JournalEntryFormValues) => {
    const payload: UpdateJournalEntryParams = {
      title: values.title.trim(),
      body: values.body.trim(),
      entry_type: values.entry_type,
      occurred_on: values.occurred_on,
    };

    updateMutation.mutate(
      { id: entryId, params: payload },
      {
        onSuccess: () => {
          toast.success('Entry updated');
          router.back();
        },
        onError: (mutationError) => {
          const message =
            mutationError instanceof Error ? mutationError.message : 'Could not save your entry';
          toast.error(message);
        },
      },
    );
  };

  return (
    <JournalEntryForm
      heading="Edit entry"
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={() => router.back()}
      isSubmitting={updateMutation.isPending}
      submitLabel="Update entry"
      submitLoadingLabel="Updating..."
    />
  );
}
