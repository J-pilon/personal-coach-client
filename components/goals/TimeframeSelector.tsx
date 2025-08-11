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
      <Text className="text-lg font-semibold text-[#F1F5F9] mb-3">
        What&apos;s your timeframe?
      </Text>
      <View className="gap-3">
        {options.map((option) => (
          <Pressable
            key={option.value}
            className={`flex-row items-center p-4 rounded-2xl border-2 ${selectedTimeframe === option.value
              ? 'border-[#33CFFF] bg-[#2B42B6]'
              : 'border-[#708090] bg-[#13203a]'
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
                ? 'border-[#33CFFF] bg-[#33CFFF]'
                : 'border-[#708090]'
                }`}
            >
              {selectedTimeframe === option.value && (
                <View className="m-auto w-2 h-2 bg-[#021A40] rounded-full" />
              )}
            </View>
            <Text
              className={`text-base ${selectedTimeframe === option.value
                ? 'text-[#F1F5F9] font-semibold'
                : 'text-[#E6FAFF]'
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
