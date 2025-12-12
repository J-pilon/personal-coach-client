import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { LoadingSkeleton } from './loading';

const HOURS = [
  { value: 1, label: '1:00' },
  { value: 2, label: '2:00' },
  { value: 3, label: '3:00' },
  { value: 4, label: '4:00' },
  { value: 5, label: '5:00' },
  { value: 6, label: '6:00' },
  { value: 7, label: '7:00' },
  { value: 8, label: '8:00' },
  { value: 9, label: '9:00' },
  { value: 10, label: '10:00' },
  { value: 11, label: '11:00' },
  { value: 12, label: '12:00' },
];

// Parse time string like "2000-01-01 09:00:00.000000000 +0000" or "09:00:00" to hour and period
const parseTimeString = (timeString: string): { hour: number; period: 'AM' | 'PM' } => {
  // Extract hours from various time formats
  const match = timeString.match(/(\d{2}):(\d{2})/);
  if (!match) {
    return { hour: 9, period: 'AM' };
  }

  let hour24 = parseInt(match[1], 10);
  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;

  return { hour: hour12, period };
};

// Convert hour and period to 24-hour time string for API
const formatTimeForAPI = (hour: number, period: 'AM' | 'PM'): string => {
  let hour24 = hour;
  if (period === 'PM' && hour !== 12) {
    hour24 = hour + 12;
  } else if (period === 'AM' && hour === 12) {
    hour24 = 0;
  }
  return `${hour24.toString().padStart(2, '0')}:00:00`;
};

const NotificationSettings = () => {
  const { preferences, isLoading, isUpdating, error, updatePreferences } =
    useNotificationPreferences();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [showHourPicker, setShowHourPicker] = useState(false);

  // Sync local state with server data
  useEffect(() => {
    if (preferences) {
      setPushEnabled(preferences.push_enabled);
      setDailyReminderEnabled(preferences.push_enabled);

      if (preferences.preferred_time) {
        const { hour, period } = parseTimeString(preferences.preferred_time);
        setSelectedHour(hour);
        setSelectedPeriod(period);
      }
    }
  }, [preferences]);

  const handlePushEnabledChange = async (value: boolean) => {
    setPushEnabled(value);
    setDailyReminderEnabled(value);

    try {
      await updatePreferences({ push_enabled: value });
    } catch {
      // Revert on error
      setPushEnabled(!value);
      setDailyReminderEnabled(!value);
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  const handleDailyReminderChange = async (value: boolean) => {
    setDailyReminderEnabled(value);

    // If enabling daily reminder, also enable push
    if (value && !pushEnabled) {
      setPushEnabled(true);
      try {
        await updatePreferences({ push_enabled: true });
      } catch {
        setPushEnabled(false);
        setDailyReminderEnabled(false);
        Alert.alert('Error', 'Failed to update notification preferences');
      }
    }
  };

  const handleTimeChange = async (hour: number, period: 'AM' | 'PM') => {
    const prevHour = selectedHour;
    const prevPeriod = selectedPeriod;

    setSelectedHour(hour);
    setSelectedPeriod(period);

    try {
      const timeString = formatTimeForAPI(hour, period);
      await updatePreferences({ preferred_time: timeString });
    } catch {
      // Revert on error
      setSelectedHour(prevHour);
      setSelectedPeriod(prevPeriod);
      Alert.alert('Error', 'Failed to update reminder time');
    }
  };

  if (isLoading) {
    return (
      <View className="mb-6">
        <Text className="mb-4 text-xl font-semibold text-white">Notification Preferences</Text>
        <View className="rounded-2xl bg-[#2B42B6] p-4">
          <LoadingSkeleton type="text" count={3} height={24} testID="notification-settings-skeleton" />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <Text className="mb-4 text-xl font-semibold text-white">Notification Preferences</Text>

      <View className="rounded-2xl bg-[#2B42B6] p-4">
        {/* Enabled Toggle */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-medium text-[#E6FAFF]">Enabled</Text>
          <Switch
            value={pushEnabled}
            onValueChange={handlePushEnabledChange}
            disabled={isUpdating}
            trackColor={{ false: '#154FA6', true: '#22d3ee' }}
            thumbColor="#fff"
            testID="push-enabled-switch"
          />
        </View>

        {/* Daily Reminder Toggle with Time */}
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-medium text-[#E6FAFF]">Daily Reminders</Text>
          <View className="flex-row gap-3 items-center">
            <Switch
              value={dailyReminderEnabled}
              onValueChange={handleDailyReminderChange}
              disabled={isUpdating}
              trackColor={{ false: '#154FA6', true: '#22d3ee' }}
              thumbColor="#fff"
              testID="daily-reminder-switch"
            />
          </View>
        </View>

        {/* Time Picker - only show when daily reminder is enabled */}
        {dailyReminderEnabled && (
          <View className="flex-row gap-2 justify-end items-center mt-4">
            {/* Hour Select Input */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-2 bg-white rounded-lg"
              onPress={() => setShowHourPicker(true)}
              disabled={isUpdating}
              testID="hour-select-button"
            >
              <Text className="mr-2 text-base font-semibold text-gray-800">
                {selectedHour}:00
              </Text>
              <Ionicons name="chevron-down" size={16} color="#4B5563" />
            </TouchableOpacity>

            {/* AM/PM Selector */}
            <View className="overflow-hidden flex-row bg-white rounded-lg">
              <TouchableOpacity
                className={`px-3 py-2 ${selectedPeriod === 'AM' ? 'bg-[#3B82F6]' : 'bg-white'}`}
                onPress={() => handleTimeChange(selectedHour, 'AM')}
                disabled={isUpdating}
                testID="am-button"
              >
                <Text
                  className={`text-base font-medium ${selectedPeriod === 'AM' ? 'text-white' : 'text-gray-600'}`}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-3 py-2 ${selectedPeriod === 'PM' ? 'bg-[#3B82F6]' : 'bg-white'}`}
                onPress={() => handleTimeChange(selectedHour, 'PM')}
                disabled={isUpdating}
                testID="pm-button"
              >
                <Text
                  className={`text-base font-medium ${selectedPeriod === 'PM' ? 'text-white' : 'text-gray-600'}`}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hour Picker Modal */}
        <Modal
          visible={showHourPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowHourPicker(false)}
        >
          <Pressable
            className="flex-1 justify-center items-center bg-black/50"
            onPress={() => setShowHourPicker(false)}
          >
            <Pressable
              className="overflow-hidden w-64 max-h-80 bg-white rounded-2xl"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="px-4 py-3 border-b border-gray-200">
                <Text className="text-lg font-semibold text-center text-gray-800">
                  Select Hour
                </Text>
              </View>
              <ScrollView className="max-h-60">
                {HOURS.map((hour) => (
                  <TouchableOpacity
                    key={hour.value}
                    className={`px-4 py-3 ${selectedHour === hour.value ? 'bg-[#3B82F6]' : 'bg-white'}`}
                    onPress={() => {
                      handleTimeChange(hour.value, selectedPeriod);
                      setShowHourPicker(false);
                    }}
                    testID={`hour-option-${hour.value}`}
                  >
                    <Text
                      className={`text-base text-center ${selectedHour === hour.value ? 'text-white font-semibold' : 'text-gray-800'
                        }`}
                    >
                      {hour.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Error Display */}
        {error && (
          <View className="p-3 mt-4 rounded-xl border border-red-500/30 bg-red-500/20">
            <Text className="text-sm text-center text-red-300">{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default NotificationSettings;

