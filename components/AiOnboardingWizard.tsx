import { Profile, ProfileUpdateData } from '@/api/users';
import { useToast } from '@/components/ToastManager';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useAiResponseHelpers } from '@/hooks/useAi';
import { useAiProxy } from '@/hooks/useAiProxy';
import { useCreateMultipleSmartGoals } from '@/hooks/useSmartGoals';
import { useCompleteOnboarding, useProfile, useUpdateProfile } from '@/hooks/useUser';
import { profileSchema } from '@/models';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { AiResponseStep, ConfirmationStep, GoalDescriptionStep, ProfileDetailsStep } from './AiOnboardingWizardSteps';
import ProgressBar from './ProgressBar';

export const onboardingProfileSchema = profileSchema
  .pick({
    first_name: true,
    last_name: true,
    work_role: true,
    education: true,
    desires: true,
    limiting_beliefs: true,
  })
  .extend({
    first_name: z.string().trim().min(1, 'First name is required').max(100),
    last_name: z.string().trim().min(1, 'Last name is required').max(100),
    work_role: z.string().trim().min(1, 'Work role is required').max(200),
    education: z.string().trim().min(1, 'Education is required').max(200),
  });

export type OnboardingProfileFormValues = z.infer<typeof onboardingProfileSchema>;

export const onboardingGoalSchema = z.object({
  goalDescription: z
    .string()
    .trim()
    .min(10, 'Please describe your goal in at least 10 characters')
    .max(2000),
});

export type OnboardingGoalFormValues = z.infer<typeof onboardingGoalSchema>;

export interface SMARTGoalData {
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
  timeframe: '1_month' | '3_months' | '6_months';
}

export interface OnboardingStep {
  id: 'profile-details' | 'goal-description' | 'ai-response' | 'confirmation';
  title: string;
  subtitle: string;
}

export interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function AiOnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [goalDescription, setGoalDescription] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const updateProfile = useUpdateProfile();
  const { data: profile } = useProfile();

  const aiProxy = useAiProxy();
  const createMultipleSmartGoals = useCreateMultipleSmartGoals();
  const completeOnboarding = useCompleteOnboarding()
  const { isSmartGoalResponse, formatMultiPeriodSmartGoalResponse } = useAiResponseHelpers();
  const toast = useToast();

  useEffect(() => {
    if (aiProxy.isJobComplete && aiProxy.jobStatus?.result) {
      setAiResponse(aiProxy.jobStatus.result);
      setIsLoading(false)
    }
  }, [aiProxy.isJobComplete, aiProxy.jobStatus]);

  const steps: OnboardingStep[] = [
    {
      id: 'profile-details',
      title: 'Tell us about yourself',
      subtitle: 'Help us provide the best coaching experience by sharing some details about yourself.'
    },
    {
      id: 'goal-description',
      title: 'What do you want to achieve?',
      subtitle: 'Describe what you want to accomplish. We\'ll create goals for 1 month, 3 months, and 6 months!'
    },
    {
      id: 'ai-response',
      title: 'Your SMART Goals',
      subtitle: 'Here\'s what AI suggests for different time periods:'
    },
    {
      id: 'confirmation',
      title: 'Ready to save your goals?',
      subtitle: 'Review and confirm your SMART goals, or go back to edit your description.'
    }
  ];

  const currentStep = steps[currentStepIndex];

  const hasProfileChanged = (values: OnboardingProfileFormValues): boolean => {
    if (!profile) return true;
    return (Object.keys(values) as (keyof OnboardingProfileFormValues)[]).some(
      key => values[key] !== profile[key as keyof Profile],
    );
  };

  const handleProfileSubmit = async (values: OnboardingProfileFormValues): Promise<void> => {
    if (!hasProfileChanged(values)) {
      setCurrentStepIndex(1);
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile.mutateAsync(values as ProfileUpdateData);
      setCurrentStepIndex(1);
    } catch {
      // apiRequest interceptor surfaces the error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalDescriptionSubmit = async (values: OnboardingGoalFormValues): Promise<void> => {
    setGoalDescription(values.goalDescription);
    try {
      setIsLoading(true);
      await aiProxy.processAiRequest(values.goalDescription);
      setCurrentStepIndex(2);
    } catch {
      // apiRequest interceptor surfaces the error toast
    }
  };

  const handleConfirmGoal = async () => {
    if (!aiResponse || !isSmartGoalResponse(aiResponse)) {
      toast.error('Invalid goal data. Please try again.');
      return;
    }

    try {
      const smartGoals: SMARTGoalData[] = [
        {
          title: `${goalDescription} (1 Month)`,
          specific: aiResponse.response.one_month?.specific || '',
          measurable: aiResponse.response.one_month?.measurable || '',
          achievable: aiResponse.response.one_month?.achievable || '',
          relevant: aiResponse.response.one_month?.relevant || '',
          time_bound: aiResponse.response.one_month?.time_bound || '1 month',
          timeframe: '1_month'
        },
        {
          title: `${goalDescription} (3 Months)`,
          specific: aiResponse.response.three_months?.specific || '',
          measurable: aiResponse.response.three_months?.measurable || '',
          achievable: aiResponse.response.three_months?.achievable || '',
          relevant: aiResponse.response.three_months?.relevant || '',
          time_bound: aiResponse.response.three_months?.time_bound || '3 months',
          timeframe: '3_months'
        },
        {
          title: `${goalDescription} (6 Months)`,
          specific: aiResponse.response.six_months?.specific || '',
          measurable: aiResponse.response.six_months?.measurable || '',
          achievable: aiResponse.response.six_months?.achievable || '',
          relevant: aiResponse.response.six_months?.relevant || '',
          time_bound: aiResponse.response.six_months?.time_bound || '6 months',
          timeframe: '6_months'
        }
      ];

      await createMultipleSmartGoals.mutateAsync(smartGoals);
      await completeOnboarding.mutateAsync();

      onComplete();
      router.replace('/(tabs)');
    } catch {
      // apiRequest interceptor surfaces the error toast
    }
  };

  const handleEditGoal = () => {
    setCurrentStepIndex(1);
  };

  const renderCurrentStep = () => {
    switch (currentStep.id) {
      case 'profile-details':
        return (
          <ProfileDetailsStep
            initialValues={{
              first_name: profile?.first_name || '',
              last_name: profile?.last_name || '',
              work_role: profile?.work_role || '',
              education: profile?.education || '',
              desires: profile?.desires || '',
              limiting_beliefs: profile?.limiting_beliefs || '',
            }}
            onSubmit={handleProfileSubmit}
            isLoading={isLoading}
          />
        );
      case 'goal-description':
        return (
          <GoalDescriptionStep
            onSubmit={handleGoalDescriptionSubmit}
            isLoading={aiProxy.isLoading}
            progress={aiProxy.progress}
            isJobFailed={aiProxy.isJobFailed}
          />
        );
      case 'ai-response':
        return (
          <AiResponseStep
            aiResponse={aiResponse}
            isSmartGoalResponse={isSmartGoalResponse}
            isLoading={isLoading}
            formatMultiPeriodSmartGoalResponse={formatMultiPeriodSmartGoalResponse}
            handleEditGoal={handleEditGoal}
            setCurrentStepIndex={setCurrentStepIndex}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationStep
            aiResponse={aiResponse}
            isSmartGoalResponse={isSmartGoalResponse}
            formatMultiPeriodSmartGoalResponse={formatMultiPeriodSmartGoalResponse}
            handleEditGoal={handleEditGoal}
            handleConfirmGoal={handleConfirmGoal}
          />
        );
    }
  };

  return (
    <LinearGradient>
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <Text className="mb-2 text-2xl font-bold text-center text-[#E6FAFF]">
              {currentStep.title}
            </Text>
            <Text className="text-base text-center text-[#E6FAFF] opacity-70">
              {currentStep.subtitle}
            </Text>
          </View>
          <ProgressBar currentStep={currentStepIndex} totalSteps={steps.length} />
          {renderCurrentStep()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
