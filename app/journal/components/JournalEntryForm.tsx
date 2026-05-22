import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { DateTimeField } from '@/components/inputs';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import {
  journalEntryFormSchema,
  type JournalEntryFormValues,
  type JournalEntryType,
} from '@/models/journal';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { EntryPromptList } from './EntryPromptList';
import { EntryTypeSelector } from './EntryTypeSelector';

const fieldErrorClassName = 'text-red-400 text-xs mt-1';

const DEFAULT_HEADING_BY_ENTRY_TYPE: Record<JournalEntryType, string> = {
  daily_journal: "Today's reflection",
  weekly_reflection: 'This week in review',
  general: 'New journal entry',
};

export interface JournalEntryFormProps {
  initialValues: JournalEntryFormValues;
  onSubmit: (values: JournalEntryFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  submitLoadingLabel: string;
  /** Static heading override. When omitted, derives from the current entry_type selection. */
  heading?: string;
}

export function JournalEntryForm({
  heading,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  submitLoadingLabel,
}: JournalEntryFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntryFormSchema),
    mode: 'onChange',
    defaultValues: initialValues,
  });

  const selectedEntryType = watch('entry_type');
  const headingText = heading ?? DEFAULT_HEADING_BY_ENTRY_TYPE[selectedEntryType];
  const occurredOnValue = watch('occurred_on');
  const selectedOccurrence = useMemo(() => {
    const occurredOnDate = new Date(occurredOnValue);
    return Number.isNaN(occurredOnDate.getTime()) ? new Date() : occurredOnDate;
  }, [occurredOnValue]);

  const handleDateTimeChange = useCallback(
    (next: Date) => {
      setValue('occurred_on', next.toISOString(), { shouldValidate: true, shouldDirty: true });
    },
    [setValue],
  );

  return (
    <LinearGradient>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 40 }}>
          <View className="gap-4">
            <Text
              className="mt-6 mb-2 font-semibold text-center text-3xl text-[#F1F5F9]"
              testID="journal-form-heading"
            >
              {headingText}
            </Text>

            <Controller
              control={control}
              name="entry_type"
              render={({ field: { value, onChange } }) => (
                <EntryTypeSelector value={value} onChange={onChange} disabled={isSubmitting} />
              )}
            />

            <EntryPromptList entryType={selectedEntryType} />

            <View>
              <Controller
                control={control}
                name="title"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className="bg-[#2B42B6] rounded-2xl p-4 text-[#F1F5F9] text-base border border-[#274B8E]"
                    placeholder="Title"
                    placeholderTextColor="#708090"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isSubmitting}
                    testID="journal-form-title-input"
                  />
                )}
              />
              {errors.title && <Text className={fieldErrorClassName}>{errors.title.message}</Text>}
            </View>

            <View>
              <DateTimeField
                value={selectedOccurrence}
                onChange={handleDateTimeChange}
                disabled={isSubmitting}
                testID="journal-form-occurred-on"
              />
              {errors.occurred_on && (
                <Text className={fieldErrorClassName}>{errors.occurred_on.message}</Text>
              )}
            </View>

            <View>
              <Controller
                control={control}
                name="body"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className="bg-[#2B42B6] rounded-2xl p-4 text-[#F1F5F9] text-base border border-[#274B8E] min-h-[180px]"
                    placeholder="Write your reflection…"
                    placeholderTextColor="#708090"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    textAlignVertical="top"
                    editable={!isSubmitting}
                    testID="journal-form-body-input"
                  />
                )}
              />
              {errors.body && (
                <Text className={fieldErrorClassName} testID="journal-form-body-error">
                  {errors.body.message}
                </Text>
              )}
            </View>

            <View className="gap-3 mt-4">
              <PrimaryButton
                title={submitLabel}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
                loadingText={submitLoadingLabel}
                testID="journal-form-save-button"
              />
              <SecondaryButton
                title="Cancel"
                onPress={onCancel}
                testID="journal-form-cancel-button"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
