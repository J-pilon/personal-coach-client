import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import OnboardingWizard from '@/components/OnboardingWizard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import LinearGradient from '@/components/ui/LinearGradient';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showWizard, setShowWizard] = useState(false);

  const handleStartWizard = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    router.replace('/(tabs)');
  };

  if (showWizard) {
    return <OnboardingWizard onComplete={handleWizardComplete} />;
  }

  return (
    <LinearGradient>
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center p-5">
          {/* Header */}
          <View className="items-center mb-10">
            <Ionicons name="rocket" size={80} color={colors.tint} />
            <Text className="text-[32px] font-bold text-center text-[#F1F5F9] mt-5 mb-2.5">
              Welcome to Personal Coach
            </Text>
            <Text className="text-base text-center text-[#E6FAFF] opacity-70 leading-6">
              Let&apos;s create your personalized SMART goals to achieve success
            </Text>
          </View>

          {/* Features */}
          <View className="mb-10">
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
              <Text className="text-base text-[#F1F5F9] ml-3">
                Set clear, measurable goals
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
              <Text className="text-base text-[#F1F5F9] ml-3">
                Track your progress over time
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
              <Text className="text-base text-[#F1F5F9] ml-3">
                Break down goals into actionable tasks
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
              <Text className="text-base text-[#F1F5F9] ml-3">
                Stay motivated with regular check-ins
              </Text>
            </View>
          </View>

          {/* SMART Goals Info */}
          <View className="bg-[#2B42B6] p-5 rounded-xl mb-10 border border-[#33CFFF] shadow-md" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
            <Text className="text-lg font-semibold text-[#F1F5F9] mb-2">
              What are SMART Goals?
            </Text>
            <Text className="text-sm text-[#E6FAFF] leading-5 opacity-80">
              SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound objectives that help you focus your efforts and increase your chances of achieving what you want.
            </Text>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 px-6 rounded-xl bg-[#33CFFF] shadow-md"
            onPress={handleStartWizard}
          >
            <Text className="text-lg font-semibold text-[#021A40] mr-2">Start Creating Goals</Text>
            <Ionicons name="arrow-forward" size={20} color="#021A40" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 