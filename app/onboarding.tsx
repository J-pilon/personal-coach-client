import AiOnboardingWizard from '@/components/AiOnboardingWizard';
import { PrimaryButton, SecondaryButton } from '@/components/buttons/';
import LinearGradient from '@/components/ui/LinearGradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { setSkippedOnboarding } from '@/utils/handleSkipOnboarding';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showWizard, setShowWizard] = useState(false);

  const handleStartWizard = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
  };

  const handleSkippingOnboarding = () => {
    setSkippedOnboarding()
    router.replace('/(tabs)')
  }

  if (showWizard) {
    return <AiOnboardingWizard onComplete={handleWizardComplete} onSkip={handleSkippingOnboarding} />;
  }

  return (
    <LinearGradient>
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center p-5">
          {/* Header */}
          <View className="items-center mb-10">
            <Ionicons name="rocket" size={80} color={colors.tint} />
            <Text className="text-[32px] font-bold text-center text-[#F1F5F9] mt-5 mb-2.5" testID="onboarding-welcome-title">
              Welcome to Personal Coach
            </Text>
            <Text className="text-base text-center text-[#E6FAFF] opacity-70 leading-6" testID="onboarding-welcome-subtitle">
              Let&apos;s use AI to create your personalized SMART goals to achieve success
            </Text>
          </View>

          {/* Features */}
          <View className="mb-10">
            <View className="flex-row items-center mb-4">
              <Ionicons name="sparkles" size={24} color={colors.tint} />
              <Text className="text-base text-[#F1F5F9] ml-3" testID="onboarding-feature-ai">
                AI-powered SMART goal creation
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
              <Text className="text-base text-[#F1F5F9] ml-3" testID="onboarding-feature-clear-goals">
                Set clear, measurable goals
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
              <Text className="text-base text-[#F1F5F9] ml-3" testID="onboarding-feature-track-progress">
                Track your progress over time
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
              <Text className="text-base text-[#F1F5F9] ml-3" testID="onboarding-feature-breakdown">
                Break down goals into actionable tasks
              </Text>
            </View>
          </View>

          <View className="bg-[#2B42B6] p-5 rounded-xl mb-10 border border-[#33CFFF] shadow-md" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
            <Text className="text-lg font-semibold text-[#F1F5F9] mb-2" testID="onboarding-smart-title">
              What are SMART Goals?
            </Text>
            <Text className="text-sm text-[#E6FAFF] leading-5 opacity-80" testID="onboarding-smart-description">
              SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound objectives that help you focus your efforts and increase your chances of achieving what you want.
            </Text>
          </View>

          <View>
            <PrimaryButton
              onPress={handleStartWizard}
              title='Start with AI'
              icon='arrow-forward'
              iconColor='#021A40' />

            <SecondaryButton
              testID="ai-onboarding-skip-button"
              title="Skip For Now"
              loadingText="Skipping onboarding..."
              onPress={handleSkippingOnboarding}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 