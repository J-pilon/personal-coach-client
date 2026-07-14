import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useOnboardingResume } from '@/hooks/useOnboardingResume';
import type { HabitModel } from '@/models/habit';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/buttons';
import ProgressFraction from './ProgressFraction';
import GoalDiscoveryStep from './steps/GoalDiscoveryStep';
import HabitsReviewStep from './steps/HabitsReviewStep';
import ProfileDeferredStep from './steps/ProfileDeferredStep';
import ReminderStep from './steps/ReminderStep';
import TodaysActionStep from './steps/TodaysActionStep';

type StepIndex = 1 | 2 | 3 | 4 | 5;

const STEP_TITLES: Record<StepIndex, { title: string; subtitle: string }> = {
  1: {
    title: 'What matters right now?',
    subtitle: 'A short conversation to shape your goal.',
  },
  2: {
    title: 'Your starter habits',
    subtitle: 'Three small habits to move the goal forward.',
  },
  3: {
    title: "Today's action",
    subtitle: 'Pick one habit to show up for today.',
  },
  4: {
    title: 'Daily check-in',
    subtitle: 'Choose when we ping you each day.',
  },
  5: {
    title: 'A little about you',
    subtitle: 'Optional — you can skip and add later.',
  },
};

export interface OnboardingWizardV2Props {
  onComplete?: () => void;
}

export default function OnboardingWizardV2({
  onComplete,
}: OnboardingWizardV2Props) {
  const resume = useOnboardingResume();
  const [step, setStep] = useState<StepIndex>(1);
  const [smartGoalId, setSmartGoalId] = useState<number | null>(null);
  const [habits, setHabits] = useState<HabitModel[]>([]);
  const [resumeApplied, setResumeApplied] = useState(false);

  useEffect(() => {
    if (resumeApplied || !resume.data) return;
    const { current_step, smart_goal_id } = resume.data;
    if (smart_goal_id) setSmartGoalId(smart_goal_id);
    if (current_step >= 1 && current_step <= 5) {
      setStep(current_step as StepIndex);
    }
    setResumeApplied(true);
  }, [resume.data, resumeApplied]);

  const handleBack = () => {
    if (step === 1) {
      Alert.alert(
        'Discard discovery and start over?',
        'Your conversation so far will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.replace('/(tabs)'),
          },
        ],
      );
      return;
    }
    setStep((s) => (s - 1) as StepIndex);
  };

  const finish = () => {
    onComplete?.();
    router.replace('/(tabs)');
  };

  const info = STEP_TITLES[step];

  return (
    <LinearGradient>
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center mb-2">
            <BackButton onPress={handleBack} />
          </View>
          <ProgressFraction current={step} total={5} />
          <View className="items-center mb-6">
            <Text className="mb-2 text-2xl font-bold text-center text-[#E6FAFF]">
              {info.title}
            </Text>
            <Text className="text-base text-center text-[#E6FAFF] opacity-70">
              {info.subtitle}
            </Text>
          </View>

          {step === 1 && (
            <GoalDiscoveryStep
              onGoalCommitted={(id) => {
                setSmartGoalId(id);
                setStep(2);
              }}
            />
          )}

          {step === 2 && smartGoalId != null && (
            <HabitsReviewStep
              smartGoalId={smartGoalId}
              onHabitsCreated={(created) => {
                setHabits(created);
                setStep(3);
              }}
            />
          )}

          {step === 3 && habits.length === 3 && (
            <TodaysActionStep
              habits={habits}
              onCommitted={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <ReminderStep onScheduleSaved={() => setStep(5)} />
          )}

          {step === 5 && <ProfileDeferredStep onFinished={finish} />}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
