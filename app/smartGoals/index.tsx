import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSmartGoals } from '@/hooks/useSmartGoals';
import { useProfile } from '@/hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import OnboardingWizard from '@/components/OnboardingWizard';
import LinearGradient from '@/components/ui/LinearGradient';

export default function SmartGoalsScreen() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: goals, isLoading: goalsLoading, error } = useSmartGoals();
  const [showWizard, setShowWizard] = useState(false);

  const handleStartOnboarding = () => {
    setShowWizard(true);
  };

  const handleOnboardingComplete = () => {
    setShowWizard(false);
    // The goals will be automatically refreshed due to React Query invalidation
  };

  if (showWizard) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // Check if onboarding is incomplete
  const isOnboardingIncomplete = profile?.onboarding_status !== 'complete';

  // Show loading while profile is loading
  if (profileLoading) {
    return (
      <LinearGradient>
        <Text className="text-[#F1F5F9] text-lg">Loading...</Text>
      </LinearGradient>
    );
  }

  // Show onboarding prompt if onboarding is incomplete
  if (isOnboardingIncomplete) {
    return (
      <LinearGradient>
        <SafeAreaView className="flex-1">
          <View className="flex-1 justify-center p-6">
            <View className="items-center mb-8">
              <View className="bg-[#33CFFF] rounded-full p-6 mb-6 shadow-lg">
                <Ionicons name="flag" size={80} color="#021A40" />
              </View>
              <Text className="text-[28px] font-semibold text-center text-[#F1F5F9] mb-4 tracking-wide">
                Create Your SMART Goals
              </Text>
              <Text className="text-lg text-center text-[#E6FAFF] opacity-90 leading-6">
                Let&apos;s set up your personalized goals to help you achieve success. We&apos;ll guide you through creating specific, measurable, achievable, relevant, and time-bound objectives.
              </Text>
            </View>

            <View className="mb-8">
              <View className="bg-[#2B42B6] rounded-2xl p-6 shadow-lg border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
                <View className="mb-3">
                  <View className="flex-row items-center mb-3">
                    <View className="bg-[#33CFFF] rounded-full p-2 mr-3">
                      <Ionicons name="checkmark-circle" size={20} color="#021A40" />
                    </View>
                    <Text className="text-[#F1F5F9] text-base font-semibold">
                      Set goals for 1 month, 3 months, and 6 months
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <View className="bg-[#33CFFF] rounded-full p-2 mr-3">
                      <Ionicons name="checkmark-circle" size={20} color="#021A40" />
                    </View>
                    <Text className="text-[#F1F5F9] text-base font-semibold">
                      Follow the proven SMART framework
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-[#33CFFF] rounded-full p-2 mr-3">
                      <Ionicons name="checkmark-circle" size={20} color="#021A40" />
                    </View>
                    <Text className="text-[#F1F5F9] text-base font-semibold">
                      Track your progress over time
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Pressable
              className="bg-[#33CFFF] py-5 px-8 rounded-2xl shadow-lg flex-row items-center justify-center"
              onPress={handleStartOnboarding}
            >
              <Text className="text-[#021A40] font-semibold text-lg mr-2">Start Creating Goals</Text>
              <Ionicons name="arrow-forward" size={20} color="#021A40" />
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Show loading while goals are loading (only if onboarding is complete)
  if (goalsLoading) {
    return (
      <LinearGradient>
        <Text className="text-[#F1F5F9] text-lg">Loading goals...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient>
        <Text className="text-[#F1F5F9] text-lg text-center mb-4">Failed to load goals</Text>
        <Text className="text-[#E6FAFF] text-center mb-6">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
      </LinearGradient>
    );
  }

  const goalsByTimeframe = {
    '1_month': goals?.filter(goal => goal.timeframe === '1_month') || [],
    '3_months': goals?.filter(goal => goal.timeframe === '3_months') || [],
    '6_months': goals?.filter(goal => goal.timeframe === '6_months') || [],
  };

  const timeframeLabels = {
    '1_month': '1 Month',
    '3_months': '3 Months',
    '6_months': '6 Months',
  };

  const renderGoal = (goal: any) => (
    <View key={goal.id} className="bg-[#2B42B6] rounded-2xl p-5 mb-4 shadow-lg border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-[#F1F5F9] flex-1 mr-4">{goal.title}</Text>
        <View className={`px-3 py-1 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-orange-500'}`}>
          <Text className="text-sm font-semibold text-white">
            {goal.completed ? 'Complete' : 'In Progress'}
          </Text>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-[#708090] text-sm font-medium mb-1">Specific:</Text>
        <Text className="text-[#E6FAFF] text-base">{goal.specific}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-[#708090] text-sm font-medium mb-1">Measurable:</Text>
        <Text className="text-[#E6FAFF] text-base">{goal.measurable}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-[#708090] text-sm font-medium mb-1">Achievable:</Text>
        <Text className="text-[#E6FAFF] text-base">{goal.achievable}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-[#708090] text-sm font-medium mb-1">Relevant:</Text>
        <Text className="text-[#E6FAFF] text-base">{goal.relevant}</Text>
      </View>

      <View className="mb-4">
        <Text className="text-[#708090] text-sm font-medium mb-1">Time-bound:</Text>
        <Text className="text-[#E6FAFF] text-base">{goal.time_bound}</Text>
      </View>

      <Pressable
        className="border-2 border-[#33CFFF] rounded-xl py-3 px-4 items-center"
        onPress={() => {
          // TODO: Navigate to edit goal screen
          Alert.alert('Edit Goal', 'Edit functionality coming soon!');
        }}
      >
        <Text className="text-[#33CFFF] font-semibold text-base">Edit Goal</Text>
      </Pressable>
    </View>
  );

  const renderTimeframeSection = (timeframe: string, goals: any[]) => (
    <View key={timeframe} className="mb-8">
      <Text className="text-2xl font-semibold text-[#F1F5F9] mb-4">
        {timeframeLabels[timeframe as keyof typeof timeframeLabels]} Goals
      </Text>
      {goals.length === 0 ? (
        <View className="bg-[#2B42B6] rounded-2xl p-8 items-center shadow-lg border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
          <Text className="text-[#708090] text-lg text-center italic">
            No {timeframeLabels[timeframe as keyof typeof timeframeLabels].toLowerCase()} goals yet.
          </Text>
        </View>
      ) : (
        goals.map(renderGoal)
      )}
    </View>
  );

  return (
    <LinearGradient>
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          <View className="mb-8">
            <Text className="text-[28px] font-semibold text-center text-[#F1F5F9] mb-2 tracking-wide">My SMART Goals</Text>
            <Text className="text-lg text-center text-[#E6FAFF] opacity-80">
              Track your progress towards achieving your goals
            </Text>
          </View>

          <View className="mb-8">
            {Object.entries(goalsByTimeframe).map(([timeframe, goals]) =>
              renderTimeframeSection(timeframe, goals)
            )}
          </View>

          <Pressable
            className="bg-[#33CFFF] py-4 px-6 rounded-2xl shadow-lg flex-row items-center justify-center mb-8"
            onPress={() => {
              // TODO: Navigate to add goal screen
              Alert.alert('Add Goal', 'Add goal functionality coming soon!');
            }}
          >
            <Ionicons name="add" size={24} color="#021A40" />
            <Text className="text-[#021A40] font-semibold text-lg ml-2">Add New Goal</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 