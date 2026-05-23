import { CreateJournalEntryParams } from '@/api/journals';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/components/ToastManager';
import { useCreateJournalEntry } from '@/hooks/useJournal';
import type { JournalEntryFormValues, JournalEntryType } from '@/models/journal';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { JournalEntryForm } from '@/app/journal/components/JournalEntryForm';

const isValidEntryType = (value: unknown): value is JournalEntryType =>
  value === 'daily_journal' || value === 'weekly_reflection' || value === 'general';

export default function NewJournalEntryScreen() {
  return (
    <ErrorBoundary scope="journal-new-entry">
      <NewJournalEntryContent />
    </ErrorBoundary>
  );
}

function NewJournalEntryContent() {
  const toast = useToast();
  const createMutation = useCreateJournalEntry();

  const { entry_type: routeEntryType } = useLocalSearchParams<{ entry_type?: string }>();
  const initialEntryType: JournalEntryType = isValidEntryType(routeEntryType)
    ? routeEntryType
    : 'daily_journal';

  const initialValues = useMemo<JournalEntryFormValues>(
    () => ({
      title: '',
      body: '',
      entry_type: initialEntryType,
      occurred_on: new Date().toISOString(),
    }),
    [initialEntryType],
  );

  const onSubmit = (values: JournalEntryFormValues) => {
    const payload: CreateJournalEntryParams = {
      title: values.title.trim(),
      body: values.body.trim(),
      entry_type: values.entry_type,
      occurred_on: values.occurred_on,
    };

    createMutation.mutate(payload, {
      onSuccess: () => router.replace('/(tabs)/journal' as any),
      onError: (mutationError) => {
        const message =
          mutationError instanceof Error ? mutationError.message : 'Could not save your entry';
        toast.error(message);
      },
    });
  };

  return (
    <JournalEntryForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={() => router.back()}
      isSubmitting={createMutation.isPending}
      submitLabel="Save entry"
      submitLoadingLabel="Saving..."
    />
  );
}
