import { formatOccurrenceDate, formatOccurrenceTime } from '@/utils/dateFormatters';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

export interface DateTimeFieldProps {
  label?: string;
  value: Date;
  onChange: (next: Date) => void;
  disabled?: boolean;
  testID?: string;
}

export function DateTimeField({
  label = 'Date and time',
  value,
  onChange,
  disabled = false,
  testID = 'date-time-field',
}: DateTimeFieldProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
      if (event.type !== 'set' || !selectedDate) return;

      const next = new Date(value);
      next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      onChange(next);
    },
    [value, onChange],
  );

  const onTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedTime?: Date) => {
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
      }
      if (event.type !== 'set' || !selectedTime) return;

      const next = new Date(value);
      next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      onChange(next);
    },
    [value, onChange],
  );

  return (
    <View>
      <Text className="text-[#E6FAFF] text-sm mb-2 font-medium">{label}</Text>
      <View className="rounded-2xl p-4 bg-[#13203a] border border-[#274B8E] gap-3">
        <Text className="text-[#E6FAFF] text-sm" testID={`${testID}-value`}>
          {formatOccurrenceDate(value)} at {formatOccurrenceTime(value)}
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-1 py-2 px-3 rounded-lg border border-[#708090] bg-[#1b2a4a]"
            disabled={disabled}
            testID={`${testID}-date-button`}
          >
            <Text className="text-center font-medium text-[#E6FAFF]">Select date</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            className="flex-1 py-2 px-3 rounded-lg border border-[#708090] bg-[#1b2a4a]"
            disabled={disabled}
            testID={`${testID}-time-button`}
          >
            <Text className="text-center font-medium text-[#E6FAFF]">Select time</Text>
          </Pressable>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          testID={`${testID}-date-picker`}
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          testID={`${testID}-time-picker`}
          value={value}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}
