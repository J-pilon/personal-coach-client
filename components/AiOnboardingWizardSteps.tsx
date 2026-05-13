import { PrimaryButton, SecondaryButton } from '@/components/buttons/';
import { LoadingSkeleton, LoadingSpinner } from '@/components/loading';
import { setSkippedOnboarding } from '@/utils/handleSkipOnboarding';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from "react";
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import {
  OnboardingGoalFormValues,
  OnboardingProfileFormValues,
  onboardingGoalSchema,
  onboardingProfileSchema,
} from './AiOnboardingWizard';

export interface ProfileDetailsStepProps {
  initialValues: OnboardingProfileFormValues;
  onSubmit: (values: OnboardingProfileFormValues) => Promise<void> | void;
  isLoading: boolean;
}

export interface GoalDescriptionStepProps {
  onSubmit: (values: OnboardingGoalFormValues) => Promise<void> | void;
  isLoading: boolean;
  progress?: number;
  isJobFailed?: boolean;
}

export interface AiResponseStepProps {
  aiResponse: any;
  isSmartGoalResponse: (response: any) => boolean;
  formatMultiPeriodSmartGoalResponse: (response: any) => Record<string, Record<string, string>>;
  handleEditGoal: () => void;
  setCurrentStepIndex: (index: number) => void;
  isLoading: boolean;
}

export interface ConfirmationStepProps {
  aiResponse: any;
  isSmartGoalResponse: (response: any) => boolean;
  formatMultiPeriodSmartGoalResponse: (response: any) => Record<string, Record<string, string>>;
  handleEditGoal: () => void;
  handleConfirmGoal: () => void;
}

const handleSkippingOnboarding = () => {
  setSkippedOnboarding();
  router.replace('/(tabs)');
};

const fieldErrorClassName = 'mt-1 text-xs text-red-400';
const inputClassName = 'border border-cyan-400 rounded-lg p-3 text-base text-[#E6FAFF] bg-slate-800';

const GoalDescriptionStep = ({ onSubmit, isLoading, progress = 0, isJobFailed = false }: GoalDescriptionStepProps) => {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<OnboardingGoalFormValues>({
    resolver: zodResolver(onboardingGoalSchema),
    mode: 'onChange',
    defaultValues: { goalDescription: '' },
  });

  return (
    <View className="">
      <View className="mb-5">
        <Text className="mb-2 text-lg font-semibold text-[#F1F5F9]">
          Describe what you want to achieve
        </Text>
        <Text className="mb-3 text-sm text-[#E6FAFF] opacity-70">
          Tell us what you want to accomplish. We&apos;ll create SMART goals for 1 month, 3 months, and 6 months. For example: &ldquo;I want to improve my fitness and run a marathon&rdquo; or &ldquo;I want to learn web development and build my own website&rdquo;
        </Text>
        <Controller
          control={control}
          name="goalDescription"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              className="border border-cyan-400 rounded-lg p-3 text-base min-h-[120px] text-[#E6FAFF] bg-slate-800"
              placeholder="e.g., I want to improve my fitness and run a marathon, or learn web development and build my own website..."
              placeholderTextColor="#708090"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              testID="onboarding-goal-description-input"
            />
          )}
        />
        {errors.goalDescription && (
          <Text className={fieldErrorClassName} testID="onboarding-goal-description-error">
            {errors.goalDescription.message}
          </Text>
        )}
      </View>

      <View className='gap-4'>
        <PrimaryButton
          title={isLoading ? `Processing... ${progress}%` : "Generate SMART Goals"}
          loadingText="Generating your SMART goal..."
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          disabled={!isValid || isLoading}
          icon="sparkles"
          className="mt-5"
        />
        {isJobFailed && (
          <Text className="mt-2 text-sm text-red-400">
            Failed to generate goals. Please try again.
          </Text>
        )}
        <SecondaryButton
          testID="ai-onboarding-skip-button"
          title="Skip For Now"
          onPress={handleSkippingOnboarding}
        />
      </View>
    </View>
  );
};

const AiResponseStep = ({ aiResponse, isSmartGoalResponse, formatMultiPeriodSmartGoalResponse, handleEditGoal, setCurrentStepIndex, isLoading }: AiResponseStepProps) => {
  if (!isLoading && (!aiResponse || !isSmartGoalResponse(aiResponse))) {
    return (
      <View className="mb-8">
        <Text className="mt-5 text-base text-center text-red-400">
          Unable to generate SMART goals. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="">
      <View className="p-5 rounded-xl border border-cyan-400 bg-slate-800">
        <View className="flex-row items-center mb-4">
          <Ionicons name="checkmark-circle" size={24} color="#33CFFF" />
          <Text className="ml-3 text-xl font-bold text-[#E6FAFF]">
            Your SMART Goals
          </Text>
        </View>

        <View className="p-4 mb-4 rounded-lg bg-slate-700">
          {isLoading ? (
            <LoadingSpinner
              size="medium"
              text="Generating SMART goals..."
              variant="inline"
              testID="ai-onboarding-wizard-steps-ai-response-step"
            />
          ) : (
            Object.entries(formatMultiPeriodSmartGoalResponse(aiResponse.response)).map(([goalTitle, goalDetails]) => (
              <View key={goalTitle} className="mb-4 last:mb-0">
                <Text className="mb-2 text-lg font-semibold text-cyan-400">
                  {goalTitle}
                </Text>
                {Object.entries(goalDetails).map(([detailKey, detailValue]) => (
                  <View key={detailKey} className="mb-2">
                    <Text className="text-sm font-medium text-slate-300">
                      {detailKey}:
                    </Text>
                    <Text className="text-sm text-[#E6FAFF] ml-2">
                      {detailValue}
                    </Text>
                  </View>
                ))}
              </View>
            )))}
        </View>

        <View className="pt-3 border-t border-slate-600">
          <Text className="mb-1 text-xs text-slate-400">
            {isLoading ? (
              <LoadingSkeleton
                type="text"
                count={2}
                height={20}
                testID="context-used-skeleton"
              />) : <Text>Context used: {aiResponse.context_used ? 'Yes' : 'No'}</Text>}
          </Text>
          <Text className="mb-1 text-xs text-slate-400">
            {isLoading ? (
              <LoadingSkeleton
                type="text"
                count={2}
                height={20}
                testID="request-id-skeleton"
              />) : <Text>Request ID: {aiResponse.request_id}</Text>}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3 mt-5">
        <TouchableOpacity
          className="flex-row flex-1 justify-center items-center px-5 py-3 rounded-lg border border-cyan-400"
          onPress={handleEditGoal}
        >
          <Ionicons name="create-outline" size={20} color="#33CFFF" />
          <Text className="ml-2 text-base font-semibold text-cyan-400">
            Edit
          </Text>
        </TouchableOpacity>

        <PrimaryButton
          title="Looks Good!"
          onPress={() => setCurrentStepIndex(3)}
          icon="arrow-forward"
          className="flex-1"
        />
      </View>
    </View>
  );
};

const ConfirmationStep = ({ aiResponse, isSmartGoalResponse, formatMultiPeriodSmartGoalResponse, handleEditGoal, handleConfirmGoal }: ConfirmationStepProps) => (
  <View className="">
    <View className="items-center mb-5">
      <View className="items-center mb-4">
        <Ionicons name="checkmark-circle" size={32} color="#33CFFF" />
        <Text className="mt-2 text-2xl font-bold text-[#E6FAFF]">
          Ready to Save Your Goals?
        </Text>
      </View>

      <Text className="mb-6 text-base leading-6 text-center text-[#E6FAFF]">
        Your SMART goals for 1 month, 3 months, and 6 months will be saved and you can start tracking your progress. You can always edit or add more goals later.
      </Text>

      <View className="p-4 w-full rounded-lg bg-slate-800">
        <Text className="mb-2 text-base font-semibold text-[#E6FAFF]">
          Goals Preview:
        </Text>
        {aiResponse && isSmartGoalResponse(aiResponse) ? (
          Object.entries(formatMultiPeriodSmartGoalResponse(aiResponse.response)).map(([goalTitle, goalDetails]) => (
            <View key={goalTitle} className="mb-3 last:mb-0">
              <Text className="mb-1 text-sm font-semibold text-cyan-400">
                {goalTitle}
              </Text>
              {Object.entries(goalDetails).map(([detailKey, detailValue]) => (
                <View key={detailKey} className="mb-1">
                  <Text className="text-xs font-medium text-slate-300">
                    {detailKey}:
                  </Text>
                  <Text className="text-xs text-[#E6FAFF] ml-2">
                    {detailValue}
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text className="text-sm leading-5 text-[#E6FAFF]">
            Goals preview not available
          </Text>
        )}
      </View>
    </View>

    <View className="flex-row gap-3 mt-5">
      <TouchableOpacity
        className="flex-row flex-1 justify-center items-center px-5 py-3 rounded-lg border border-cyan-400"
        onPress={handleEditGoal}
      >
        <Ionicons name="arrow-back" size={20} color="#33CFFF" />
        <Text className="ml-2 text-base font-semibold text-cyan-400">
          Edit
        </Text>
      </TouchableOpacity>

      <PrimaryButton
        title="Save & Continue"
        onPress={handleConfirmGoal}
        icon="checkmark"
        className="flex-1"
      />
    </View>
  </View>
);

const ProfileDetailsStep = ({ initialValues, onSubmit, isLoading }: ProfileDetailsStepProps) => {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<OnboardingProfileFormValues>({
    resolver: zodResolver(onboardingProfileSchema),
    mode: 'onChange',
    defaultValues: initialValues,
  });

  return (
    <View className="">
      <View className="">
        <View className="mb-4">
          <Text testID="first-name-label" className="mb-2 text-sm font-medium text-[#E6FAFF]">
            First Name *
          </Text>
          <Controller
            control={control}
            name="first_name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                testID="first-name-input"
                className={inputClassName}
                placeholder="Enter your first name"
                placeholderTextColor="#708090"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.first_name && (
            <Text className={fieldErrorClassName} testID="first-name-error">
              {errors.first_name.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text testID="last-name-label" className="mb-2 text-sm font-medium text-[#E6FAFF]">
            Last Name *
          </Text>
          <Controller
            control={control}
            name="last_name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                testID="last-name-input"
                className={inputClassName}
                placeholder="Enter your last name"
                placeholderTextColor="#708090"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.last_name && (
            <Text className={fieldErrorClassName} testID="last-name-error">
              {errors.last_name.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text testID="work-role-label" className="mb-2 text-sm font-medium text-[#E6FAFF]">
            Work Role *
          </Text>
          <Controller
            control={control}
            name="work_role"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                testID="work-role-input"
                className={inputClassName}
                placeholder="e.g., Software Engineer, Marketing Manager, Student"
                placeholderTextColor="#708090"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.work_role && (
            <Text className={fieldErrorClassName} testID="work-role-error">
              {errors.work_role.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text testID="education-label" className="mb-2 text-sm font-medium text-[#E6FAFF]">
            Education *
          </Text>
          <Controller
            control={control}
            name="education"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                testID="education-input"
                className={inputClassName}
                placeholder="e.g., Bachelor's in Computer Science, High School Diploma"
                placeholderTextColor="#708090"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.education && (
            <Text className={fieldErrorClassName} testID="education-error">
              {errors.education.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text testID="desires-label" className="mb-2 text-sm font-medium text-[#E6FAFF]">
            Desires (Optional)
          </Text>
          <Text testID="desires-description" className="mb-2 text-xs text-[#708090]">
            What do you want to achieve? What drives you? This helps us provide better coaching.
          </Text>
          <Controller
            control={control}
            name="desires"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                testID="desires-input"
                className="border border-cyan-400 rounded-lg p-3 text-base min-h-[80px] text-[#E6FAFF] bg-slate-800"
                placeholder="e.g., I want to be financially independent, I want to make a positive impact..."
                placeholderTextColor="#708090"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          />
        </View>

        <View className="mb-4">
          <Text testID="limiting-beliefs-label" className="mb-2 text-sm font-medium text-[#E6FAFF]">
            Limiting Beliefs (Optional)
          </Text>
          <Text testID="limiting-beliefs-description" className="mb-2 text-xs text-[#708090]">
            What holds you back? What do you struggle with? This helps us provide better coaching.
          </Text>
          <Controller
            control={control}
            name="limiting_beliefs"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                testID="limiting-beliefs-input"
                className="border border-cyan-400 rounded-lg p-3 text-base min-h-[80px] text-[#E6FAFF] bg-slate-800"
                placeholder="e.g., I'm not good enough, I don't have enough time..."
                placeholderTextColor="#708090"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          />
        </View>
      </View>

      <View className='gap-4'>
        <PrimaryButton
          testID="profile-continue-button"
          title="Continue"
          loadingText="Saving profile..."
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          disabled={!isValid || isLoading}
          icon="arrow-forward"
          className="mt-5"
        />
        <SecondaryButton
          testID="ai-onboarding-skip-button"
          title="Skip For Now"
          onPress={handleSkippingOnboarding}
        />
      </View>
    </View>
  );
};

export { AiResponseStep, ConfirmationStep, GoalDescriptionStep, ProfileDetailsStep };
