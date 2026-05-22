import { CreateJournalEntryParams } from '@/api/journals';
import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/components/ToastManager';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useCreateJournalEntry } from '@/hooks/useJournal';
import {
  journalEntryFormSchema,
  type JournalEntryFormValues,
  type JournalEntryType,
} from '@/models/journal';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';

const fieldErrorClassName = 'text-red-400 text-xs mt-1';

const ENTRY_TYPES: readonly { value: JournalEntryType; label: string }[] = [
  { value: 'daily_journal', label: 'Daily' },
  { value: 'weekly_reflection', label: 'Weekly' },
  { value: 'general', label: 'General' },
];

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

const HEADING_BY_ENTRY_TYPE: Record<JournalEntryType, string> = {
  daily_journal: "Today's reflection",
  weekly_reflection: 'This week in review',
  general: 'New journal entry',
};

const isValidEntryType = (value: unknown): value is JournalEntryType =>
  value === 'daily_journal' || value === 'weekly_reflection' || value === 'general';

const formatOccurrenceDate = (value: Date) =>
  value.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const formatOccurrenceTime = (value: Date) =>
  value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntryFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      body: '',
      entry_type: initialEntryType,
      occurred_on: new Date().toISOString(),
    },
  });

  const selectedEntryType = watch('entry_type');
  const occurredOnValue = watch('occurred_on');
  const selectedOccurrence = useMemo(() => {
    const occurredOnDate = new Date(occurredOnValue);
    return Number.isNaN(occurredOnDate.getTime()) ? new Date() : occurredOnDate;
  }, [occurredOnValue]);
  const prompts = PROMPTS_BY_ENTRY_TYPE[selectedEntryType];
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const updateOccurredOn = useCallback(
    (nextDate: Date) => {
      setValue('occurred_on', nextDate.toISOString(), { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  const onDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
      if (event.type !== 'set' || !selectedDate) {
        return;
      }

      const nextDate = new Date(selectedOccurrence);
      nextDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      updateOccurredOn(nextDate);
    },
    [selectedOccurrence, updateOccurredOn]
  );

  const onTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedTime?: Date) => {
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
      }
      if (event.type !== 'set' || !selectedTime) {
        return;
      }

      const nextDate = new Date(selectedOccurrence);
      nextDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      updateOccurredOn(nextDate);
    },
    [selectedOccurrence, updateOccurredOn]
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
        const message = mutationError instanceof Error ? mutationError.message : 'Could not save your entry';
        toast.error(message);
      },
    });
  };

  return (
    <LinearGradient>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 40 }}>
          <View className="gap-4">
            <Text
              className="mt-6 mb-2 font-semibold text-center text-3xl text-[#F1F5F9]"
              testID="journal-form-heading"
            >
              {HEADING_BY_ENTRY_TYPE[selectedEntryType]}
            </Text>

            <View className="mb-2">
              <Text className="text-[#E6FAFF] text-sm mb-2 font-medium">Entry type</Text>
              <Controller
                control={control}
                name="entry_type"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-row gap-2">
                    {ENTRY_TYPES.map(({ value: optionValue, label }) => {
                      const selected = value === optionValue;
                      return (
                        <Pressable
                          key={optionValue}
                          onPress={() => onChange(optionValue)}
                          className={`flex-1 py-2 px-3 rounded-lg border ${selected ? 'border-cyan-400 bg-cyan-400' : 'border-[#708090] bg-[#13203a]'
                            }`}
                          disabled={createMutation.isPending}
                          testID={`journal-form-entry-type-${optionValue}`}
                        >
                          <Text
                            className={`text-center font-medium ${selected ? 'text-[#021A40]' : 'text-[#E6FAFF]'
                              }`}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {prompts.length > 0 && (
              <View
                className="rounded-2xl p-4 bg-[#13203a] border border-[#274B8E]"
                testID="journal-form-prompts"
              >
                <Text className="text-[#22d3ee] text-xs uppercase tracking-wider mb-2">Prompts</Text>
                {prompts.map((prompt) => (
                  <Text key={prompt} className="text-[#E6FAFF] text-sm leading-5 mb-1">
                    • {prompt}
                  </Text>
                ))}
              </View>
            )}

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
                    editable={!createMutation.isPending}
                    testID="journal-form-title-input"
                  />
                )}
              />
              {errors.title && <Text className={fieldErrorClassName}>{errors.title.message}</Text>}
            </View>

            <View>
              <Text className="text-[#E6FAFF] text-sm mb-2 font-medium">Date and time</Text>
              <View className="rounded-2xl p-4 bg-[#13203a] border border-[#274B8E] gap-3">
                <Text className="text-[#E6FAFF] text-sm" testID="journal-form-occurred-on-value">
                  {formatOccurrenceDate(selectedOccurrence)} at {formatOccurrenceTime(selectedOccurrence)}
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    className="flex-1 py-2 px-3 rounded-lg border border-[#708090] bg-[#1b2a4a]"
                    disabled={createMutation.isPending}
                    testID="journal-form-date-picker-button"
                  >
                    <Text className="text-center font-medium text-[#E6FAFF]">Select date</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    className="flex-1 py-2 px-3 rounded-lg border border-[#708090] bg-[#1b2a4a]"
                    disabled={createMutation.isPending}
                    testID="journal-form-time-picker-button"
                  >
                    <Text className="text-center font-medium text-[#E6FAFF]">Select time</Text>
                  </Pressable>
                </View>
              </View>
              {errors.occurred_on && <Text className={fieldErrorClassName}>{errors.occurred_on.message}</Text>}
            </View>

            {showDatePicker && (
              <DateTimePicker
                testID="journal-form-date-picker"
                value={selectedOccurrence}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                testID="journal-form-time-picker"
                value={selectedOccurrence}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}

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
                    editable={!createMutation.isPending}
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
                title="Save entry"
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || createMutation.isPending}
                isLoading={createMutation.isPending}
                loadingText="Saving..."
                testID="journal-form-save-button"
              />
              <SecondaryButton
                title="Cancel"
                onPress={() => router.back()}
                testID="journal-form-cancel-button"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
