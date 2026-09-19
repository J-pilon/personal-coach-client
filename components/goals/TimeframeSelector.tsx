import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { TimeframeOption } from '../../utils/smartGoalFormatters';

interface TimeframeSelectorProps {
  options: TimeframeOption[];
  selectedTimeframe: string;
  onTimeframeSelect: (timeframe: string) => void;
  testID?: string;
}

export const TimeframeSelector = ({
  options,
  selectedTimeframe,
  onTimeframeSelect,
  testID: testIDProp = 'timeframe-selector'
}: TimeframeSelectorProps) => {
  return (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-ink-primary mb-3">
        What&apos;s your timeframe?
      </Text>
      <View className="gap-3">
        {options.map((option) => (
          <Pressable
            key={option.value}
            className={`flex-row items-center p-4 rounded-2xl border-2 ${selectedTimeframe === option.value
              ? 'border-accent bg-surface-card'
              : 'border-border-muted bg-surface-input'
              }`}
            style={{
              shadowColor: '#274B8E',
              shadowOpacity: 0.10,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 }
            }}
            onPress={() => onTimeframeSelect(option.value)}
            testID={`${testIDProp}-option-${option.value.replace(' ', '-')}`}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 ${selectedTimeframe === option.value
                ? 'border-accent bg-[#33CFFF]'
                : 'border-border-muted'
                }`}
            >
              {selectedTimeframe === option.value && (
                <View className="m-auto w-2 h-2 bg-[#021A40] rounded-full" />
              )}
            </View>
            <Text
              className={`text-base ${selectedTimeframe === option.value
                ? 'text-ink-primary font-semibold'
                : 'text-ink-secondary'
                }`}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
