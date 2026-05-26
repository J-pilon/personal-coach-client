import { getGoalDueStatus, type GoalDueVariant } from '@/utils/smartGoalFormatters';
import React from 'react';
import { Text, View } from 'react-native';

const VARIANT_STYLES: Record<GoalDueVariant, { container: string; text: string }> = {
  neutral: { container: 'bg-[#274B8E]', text: 'text-[#33CFFF]' },
  warning: { container: 'bg-orange-800', text: 'text-orange-300' },
  danger: { container: 'bg-red-900', text: 'text-red-400' },
};

interface GoalDueBadgeProps {
  targetDate: string | undefined;
  completed: boolean;
  testID?: string;
}

export function GoalDueBadge({ targetDate, completed, testID }: GoalDueBadgeProps) {
  const status = getGoalDueStatus(targetDate, completed);

  if (status.kind === 'none') return null;

  const styles = VARIANT_STYLES[status.variant];

  return (
    <View className={`px-2 py-1 rounded-full ${styles.container}`}>
      <Text className={`text-xs font-medium ${styles.text}`} testID={testID}>
        {status.label}
      </Text>
    </View>
  );
}
