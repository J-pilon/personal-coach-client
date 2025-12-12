import { ProfileUpdateData } from '@/api/users';
import { PrimaryButton, SecondaryButton } from '@/components/buttons/';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView as RNScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Common timezones list
const TIMEZONES = [
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
  { value: 'America/Denver', label: 'Mountain Time (MST)' },
  { value: 'America/Chicago', label: 'Central Time (CST)' },
  { value: 'America/New_York', label: 'Eastern Time (EST)' },
  { value: 'America/Halifax', label: 'Atlantic Time (AST)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'Atlantic/Reykjavik', label: 'Iceland (GMT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)' },
  { value: 'UTC', label: 'UTC' },
];

// Get the device's timezone
const getDeviceTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

// Get label for timezone value
const getTimezoneLabel = (value: string): string => {
  const tz = TIMEZONES.find(t => t.value === value);
  return tz ? tz.label : value;
};

interface ProfileEditFormProps {
  profile: {
    id: number;
    first_name?: string;
    last_name?: string;
    work_role?: string;
    education?: string;
    desires?: string;
    limiting_beliefs?: string;
    timezone?: string;
    onboarding_status: 'incomplete' | 'complete';
  };
  isLoading: boolean;
  onCancel: () => void;
  onSuccess: (formData: ProfileUpdateData) => Promise<void>;
}

export default function ProfileEditForm({ profile, isLoading, onCancel, onSuccess }: ProfileEditFormProps) {
  const deviceTimezone = getDeviceTimezone();

  const [formData, setFormData] = useState<ProfileUpdateData>({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    work_role: profile.work_role || '',
    education: profile.education || '',
    desires: profile.desires || '',
    limiting_beliefs: profile.limiting_beliefs || '',
    timezone: profile.timezone || deviceTimezone,
  });

  const [showTimezonePicker, setShowTimezonePicker] = useState(false);

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTimezoneSelect = (timezone: string) => {
    handleInputChange('timezone', timezone);
    setShowTimezonePicker(false);
  };

  return (
    <LinearGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
            paddingBottom: 40
          }}
        >
          <View className="mb-6">
            <Text className="text-xl font-semibold text-[#E6FAFF] mb-4" testID="profile-edit-title">Edit Profile</Text>

            <View className="bg-[#2B42B6] rounded-2xl p-5 mb-4 shadow-md border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
              <Text className="text-[#708090] text-sm font-medium mb-1">First Name</Text>
              <TextInput
                className="bg-[#1A2B5C] rounded-xl p-3 text-[#F1F5F9] text-base mb-4"
                value={formData.first_name}
                onChangeText={(value) => handleInputChange('first_name', value)}
                placeholder="Enter first name"
                placeholderTextColor="#708090"
                testID="profile-edit-first-name"
              />

              <Text className="text-[#708090] text-sm font-medium mb-1">Last Name</Text>
              <TextInput
                className="bg-[#1A2B5C] rounded-xl p-3 text-[#F1F5F9] text-base mb-4"
                value={formData.last_name}
                onChangeText={(value) => handleInputChange('last_name', value)}
                placeholder="Enter last name"
                placeholderTextColor="#708090"
                testID="profile-edit-last-name"
              />

              <Text className="text-[#708090] text-sm font-medium mb-1">Work Role</Text>
              <TextInput
                className="bg-[#1A2B5C] rounded-xl p-3 text-[#F1F5F9] text-base mb-4"
                value={formData.work_role}
                onChangeText={(value) => handleInputChange('work_role', value)}
                placeholder="Enter work role"
                placeholderTextColor="#708090"
                testID="profile-edit-work-role"
              />

              <Text className="text-[#708090] text-sm font-medium mb-1">Education</Text>
              <TextInput
                className="bg-[#1A2B5C] rounded-xl p-3 text-[#F1F5F9] text-base mb-4"
                value={formData.education}
                onChangeText={(value) => handleInputChange('education', value)}
                placeholder="Enter education"
                placeholderTextColor="#708090"
                testID="profile-edit-education"
              />

              <Text className="text-[#708090] text-sm font-medium mb-1">Timezone</Text>
              <TouchableOpacity
                className="bg-[#1A2B5C] rounded-xl p-3 flex-row items-center justify-between"
                onPress={() => setShowTimezonePicker(true)}
                testID="profile-edit-timezone-button"
              >
                <Text className="text-[#F1F5F9] text-base">
                  {getTimezoneLabel(formData.timezone || deviceTimezone)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#708090" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xl font-semibold text-[#E6FAFF] mb-4" testID="profile-edit-goals-title">Goals & Aspirations</Text>

            <View className="bg-[#2B42B6] rounded-2xl p-5 mb-4 shadow-md border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
              <Text className="text-[#708090] text-sm font-medium mb-1">Desires</Text>
              <TextInput
                className="bg-[#1A2B5C] rounded-xl p-3 text-[#F1F5F9] text-base mb-4"
                value={formData.desires}
                onChangeText={(value) => handleInputChange('desires', value)}
                placeholder="What do you desire to achieve?"
                placeholderTextColor="#708090"
                multiline
                numberOfLines={3}
                testID="profile-edit-desires"
              />

              <Text className="text-[#708090] text-sm font-medium mb-1">Limiting Beliefs</Text>
              <TextInput
                className="bg-[#1A2B5C] rounded-xl p-3 text-[#F1F5F9] text-base mb-4"
                value={formData.limiting_beliefs}
                onChangeText={(value) => handleInputChange('limiting_beliefs', value)}
                placeholder="What beliefs might be holding you back?"
                placeholderTextColor="#708090"
                multiline
                numberOfLines={3}
                testID="profile-edit-limiting-beliefs"
              />
            </View>
          </View>

          <View className="gap-4">
            <PrimaryButton
              title='Save Changes'
              onPress={() => onSuccess(formData)}
              isLoading={isLoading}
              loadingText='Saving...'
              testID='profile-edit-save-button'
              disabled={isLoading}
            />

            <SecondaryButton
              title='Cancel'
              onPress={onCancel}
              testID='profile-edit-cancel-button'
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Timezone Picker Modal */}
      <Modal
        visible={showTimezonePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimezonePicker(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setShowTimezonePicker(false)}
        >
          <Pressable
            className="overflow-hidden w-80 max-h-96 bg-white rounded-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="px-4 py-3 border-b border-gray-200">
              <Text className="text-lg font-semibold text-center text-gray-800">
                Select Timezone
              </Text>
            </View>
            <RNScrollView className="max-h-80">
              {TIMEZONES.map((tz) => (
                <TouchableOpacity
                  key={tz.value}
                  className={`px-4 py-3 ${formData.timezone === tz.value ? 'bg-[#3B82F6]' : 'bg-white'}`}
                  onPress={() => handleTimezoneSelect(tz.value)}
                  testID={`timezone-option-${tz.value}`}
                >
                  <Text
                    className={`text-base ${formData.timezone === tz.value ? 'text-white font-semibold' : 'text-gray-800'}`}
                  >
                    {tz.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </RNScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}
