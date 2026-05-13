import { PrimaryButton, SecondaryButton } from '@/components/buttons/';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { z } from 'zod';
import { GoalDescriptionInput } from '../../components/goals/GoalDescriptionInput';
import { GoalPreviewCard } from '../../components/goals/GoalPreviewCard';
import { TimeframeSelector } from '../../components/goals/TimeframeSelector';
import LoadingSpinner from '../../components/LoadingSpinner';
import LinearGradient from '../../components/ui/LinearGradient';
import ScrollView from '../../components/util/ScrollView';
import { useGoalCreation } from '../../hooks/useGoalCreation';
import { TIMEFRAME_OPTIONS, formatTimeframeForAiResponse } from '../../utils/smartGoalFormatters';

const TIMEFRAME_VALUES = ['1 month', '3 months', '6 months'] as const;

const addGoalFormSchema = z.object({
  goalDescription: z
    .string()
    .trim()
    .min(10, 'Please describe your goal in at least 10 characters')
    .max(2000, 'Goal description is too long'),
  selectedTimeframe: z.enum(TIMEFRAME_VALUES, { message: 'Please select a timeframe' }),
});

type AddGoalFormValues = z.infer<typeof addGoalFormSchema>;

const fieldErrorClassName = 'text-red-400 text-xs mt-2';

export default function AddGoalScreen() {
  return (
    <ErrorBoundary scope="add-goal">
      <AddGoalContent />
    </ErrorBoundary>
  );
}

function AddGoalContent() {
  const {
    handleCreateGoal,
    handleConfirmGoal,
    handleEditGoal,
    handleCancel,
    isLoading,
    aiResponse,
    showConfirmation,
  } = useGoalCreation();

  const { control, handleSubmit, getValues, formState: { errors, isValid } } = useForm<AddGoalFormValues>({
    resolver: zodResolver(addGoalFormSchema),
    mode: 'onChange',
    defaultValues: {
      goalDescription: '',
      selectedTimeframe: undefined,
    },
  });

  const onCreate = (values: AddGoalFormValues) =>
    handleCreateGoal(values.goalDescription, values.selectedTimeframe);

  const onConfirm = () => {
    const { goalDescription, selectedTimeframe } = getValues();
    if (!selectedTimeframe) return;
    return handleConfirmGoal(goalDescription, selectedTimeframe);
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        variant="fullscreen"
        text="AI is crafting your SMART goal..."
        size="large"
        testID="goal-creation-loading"
      />
    );
  }

  if (!isLoading && aiResponse && showConfirmation) {
    const selectedTimeframe = getValues('selectedTimeframe');
    return (
      <LinearGradient>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
            paddingBottom: 40
          }}
        >
          <View className="flex-row items-center mb-8">
            <Text className="text-2xl font-semibold text-[#F1F5F9]">
              Confirm Your Goal
            </Text>
          </View>

          {selectedTimeframe && (
            <GoalPreviewCard
              goalData={formatTimeframeForAiResponse(selectedTimeframe, aiResponse)}
              testID="add-goal-preview-card"
            />
          )}

          <View className="gap-4 mb-8">
            <PrimaryButton
              onPress={onConfirm}
              title="Confirm & Save Goal"
              testID="confirm-goal-button"
            />
            <SecondaryButton
              onPress={handleEditGoal}
              title="Edit Goal"
              className='border border-cyan-400'
              testID="edit-goal-button"
            />
            <SecondaryButton
              onPress={handleCancel}
              title="Cancel"
              testID="cancel-goal-button"
            />
          </View>
        </ScrollView>
      </LinearGradient >
    );
  }

  return (
    <LinearGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
            paddingBottom: 40
          }}
        >
          <View className="mb-8">
            <View className="flex-row items-center mb-6">
              <Text className="text-2xl font-semibold text-[#F1F5F9]">
                Create New Goal
              </Text>
            </View>

            <View className="p-6 bg-[#2B42B6] rounded-2xl shadow-lg border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
              <View className="flex-row items-center mb-3">
                <View className="p-2 mr-3 bg-cyan-400 rounded-full">
                  <Ionicons name="flag" size={20} color="#021A40" />
                </View>
                <Text className="text-[#F1F5F9] text-base font-semibold">
                  Let&apos;s create a SMART goal together
                </Text>
              </View>
              <Text className="text-[#E6FAFF] text-sm leading-5">
                Describe what you want to achieve and we&apos;ll help you break it down into specific, measurable, achievable, relevant, and time-bound objectives.
              </Text>
            </View>
          </View>

          <Controller
            control={control}
            name="goalDescription"
            render={({ field: { value, onChange } }) => (
              <GoalDescriptionInput
                value={value}
                onChangeText={onChange}
                testID="add-goal-description-input"
              />
            )}
          />
          {errors.goalDescription && (
            <Text className={fieldErrorClassName} testID="add-goal-description-error">
              {errors.goalDescription.message}
            </Text>
          )}

          <Controller
            control={control}
            name="selectedTimeframe"
            render={({ field: { value, onChange } }) => (
              <TimeframeSelector
                options={TIMEFRAME_OPTIONS}
                selectedTimeframe={value ?? ''}
                onTimeframeSelect={onChange}
                testID="add-goal-timeframe-selector"
              />
            )}
          />
          {errors.selectedTimeframe && (
            <Text className={fieldErrorClassName} testID="add-goal-timeframe-error">
              {errors.selectedTimeframe.message}
            </Text>
          )}

          <View className="gap-4">
            <PrimaryButton
              onPress={handleSubmit(onCreate)}
              title={isLoading ? 'Creating Goal...' : 'Create SMART Goal'}
              disabled={!isValid || isLoading}
              testID="add-goal-create-goal-button"
            />
            <SecondaryButton
              onPress={() => router.back()}
              title='Cancel'
              testID='add-goal-cancel-button'
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
