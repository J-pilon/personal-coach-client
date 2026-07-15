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
      className="self-center px-3 py-1 mb-4 rounded-full bg-slate-800 border border-cyan-400"
    >
      <Text className="text-xs font-semibold text-cyan-400">
        Step {current} of {total}
      </Text>
    </View>
  );
}
