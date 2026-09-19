import React from 'react';
import { Text, View } from 'react-native';

interface ProgressFractionProps {
  current: number;
  total: number;
}

export default function ProgressFraction({ current, total }: ProgressFractionProps) {
  return (
    <View
      testID="onboarding-v2-progress-fraction"
      className="self-center px-3 py-1 mb-4 rounded-full bg-slate-800 border border-accent"
    >
      <Text className="text-xs font-semibold text-accent">
        Step {current} of {total}
      </Text>
    </View>
  );
}
