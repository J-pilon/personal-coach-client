import React from 'react';
import { Text, View } from 'react-native';
import { SmartGoalResponse } from '../../utils/smartGoalFormatters';

interface GoalPreviewCardProps {
  goalData: SmartGoalResponse;
  testID?: string;
}

export const GoalPreviewCard = ({
  goalData,
  testID: testIDProp = 'goal-preview-card'
}: GoalPreviewCardProps) => {
  const renderSmartCriteria = (label: string, value: string, testID: string) => (
    <View key={label}>
      <Text className="mb-1 text-sm font-medium text-ink-muted">
        {label}
      </Text>
      <Text className="text-ink-secondary" testID={testID}>
        {value}
      </Text>
    </View>
  );

  return (
    <View
      className="p-6 mb-6 bg-surface-card rounded-2xl shadow-lg border border-accent"
      style={{
        shadowColor: '#274B8E',
        shadowOpacity: 0.10,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 }
      }}
      testID={testIDProp}
    >
      <Text className="text-lg font-semibold text-ink-primary mb-4">
        Your SMART Goal
      </Text>

      <View className="space-y-4">
        {renderSmartCriteria('Specific', goalData.specific, `${testIDProp}-specific`)}
        {renderSmartCriteria('Measurable', goalData.measurable, `${testIDProp}-measurable`)}
        {renderSmartCriteria('Achievable', goalData.achievable, `${testIDProp}-achievable`)}
        {renderSmartCriteria('Relevant', goalData.relevant, `${testIDProp}-relevant`)}

        <View>
          <Text className="text-ink-secondary" testID={`${testIDProp}-time-bound`}>
            {goalData.time_bound}
          </Text>
        </View>
      </View>
    </View>
  );
};
