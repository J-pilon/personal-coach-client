import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export default function ProgressBar({ currentStep, totalSteps, className = "" }: ProgressBarProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View className={`mb-8 ${className}`}>
      <View className="h-1.5 bg-slate-800 rounded-sm mb-2">
        <View
          className="h-full bg-cyan-400 rounded-sm"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </View>
      <Text className="text-sm font-medium text-center text-[#E6FAFF]">
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
}
