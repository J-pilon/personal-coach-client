import { ProfileUpdateData } from '@/api/users';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useAiResponseHelpers } from '@/hooks/useAi';
import { useAiProxy } from '@/hooks/useAiProxy';
import { useCreateMultipleSmartGoals } from '@/hooks/useSmartGoals';
import { useCompleteOnboarding, useUpdateProfile } from '@/hooks/useUser';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AiResponseStep, ConfirmationStep, GoalDescriptionStep, ProfileDetailsStep } from './AiOnboardingWizardSteps';
import ProgressBar from './ProgressBar';

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
}

export default function AiOnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [goalDescription, setGoalDescription] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileUpdateData>({
    first_name: '',
    last_name: '',
    work_role: '',
    education: '',
    desires: '',
    limiting_beliefs: ''
  });

  const aiProxy = useAiProxy();
  const createMultipleSmartGoals = useCreateMultipleSmartGoals();
  const updateProfile = useUpdateProfile();
  const completeOnboarding = useCompleteOnboarding()
  const { isSmartGoalResponse, formatMultiPeriodSmartGoalResponse } = useAiResponseHelpers();

  // Handle completed job results
  useEffect(() => {
    if (aiProxy.isJobComplete && aiProxy.jobStatus?.result) {
      setAiResponse(aiProxy.jobStatus.result);
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

  const handleSubmitProfileDetails = async () => {
    if (!profileData.first_name?.trim() || !profileData.last_name?.trim() || !profileData.work_role?.trim() || !profileData.education?.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields (First Name, Last Name, Work Role, and Education).');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile.mutateAsync(profileData);
      setCurrentStepIndex(1);
    } catch (error) {
      Alert.alert('Error', 'Failed to update your profile details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitGoalDescription = async () => {
    if (!goalDescription.trim()) {
      Alert.alert('Missing Description', 'Please describe what you want to achieve.');
      return;
    }

    try {
      await aiProxy.mutateAsync(goalDescription.trim());
      setCurrentStepIndex(2);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate your SMART goal. Please try again.');
    }
  };

  const handleConfirmGoal = async () => {
    if (!aiResponse || !isSmartGoalResponse(aiResponse)) {
      Alert.alert('Error', 'Invalid goal data. Please try again.');
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
    } catch (error) {
      Alert.alert('Error', 'Failed to save your goals. Please try again.');
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
            profileData={profileData}
            setProfileData={setProfileData}
            handleSubmit={handleSubmitProfileDetails}
            isLoading={false}
          />
        );
      case 'goal-description':
        return (
          <GoalDescriptionStep
            goalDescription={goalDescription}
            setGoalDescription={setGoalDescription}
            handleSubmit={handleSubmitGoalDescription}
            isLoading={aiProxy.isLoading}
            progress={aiProxy.progress}
            isJobComplete={aiProxy.isJobComplete}
            isJobFailed={aiProxy.isJobFailed}
          />
        );
      case 'ai-response':
        return (
          <AiResponseStep
            aiResponse={aiResponse}
            isSmartGoalResponse={isSmartGoalResponse}
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
          {/* Header */}
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