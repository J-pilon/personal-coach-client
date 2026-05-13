import { ProfileUpdateData } from '@/api/users';
import { PrimaryButton, SecondaryButton } from '@/components/buttons/';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { profileSchema } from '@/models';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView as RNScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

// Form schema: pick the editable fields off the canonical profile model.
const profileEditFormSchema = profileSchema.pick({
  first_name: true,
  last_name: true,
  work_role: true,
  education: true,
  desires: true,
  limiting_beliefs: true,
  timezone: true,
});

type ProfileEditFormValues = z.infer<typeof profileEditFormSchema>;

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

const getDeviceTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

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

const fieldErrorClassName = 'text-red-400 text-xs mt-1 mb-3';
const inputClassName = 'bg-[#1A2B5C] rounded-xl p-3 text-[#F1F5F9] text-base mb-1';

export default function ProfileEditForm({ profile, isLoading, onCancel, onSuccess }: ProfileEditFormProps) {
  const deviceTimezone = getDeviceTimezone();
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditFormSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      work_role: profile.work_role || '',
      education: profile.education || '',
      desires: profile.desires || '',
      limiting_beliefs: profile.limiting_beliefs || '',
      timezone: profile.timezone || deviceTimezone,
    },
  });

  const onSubmit = (values: ProfileEditFormValues) => onSuccess(values);

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
              <Controller
                control={control}
                name="first_name"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClassName}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter first name"
                    placeholderTextColor="#708090"
                    testID="profile-edit-first-name"
                  />
                )}
              />
              {errors.first_name && (
                <Text className={fieldErrorClassName} testID="profile-edit-first-name-error">
                  {errors.first_name.message}
                </Text>
              )}

              <Text className="text-[#708090] text-sm font-medium mb-1 mt-3">Last Name</Text>
              <Controller
                control={control}
                name="last_name"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClassName}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter last name"
                    placeholderTextColor="#708090"
                    testID="profile-edit-last-name"
                  />
                )}
              />
              {errors.last_name && (
                <Text className={fieldErrorClassName} testID="profile-edit-last-name-error">
                  {errors.last_name.message}
                </Text>
              )}

              <Text className="text-[#708090] text-sm font-medium mb-1 mt-3">Work Role</Text>
              <Controller
                control={control}
                name="work_role"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClassName}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter work role"
                    placeholderTextColor="#708090"
                    testID="profile-edit-work-role"
                  />
                )}
              />
              {errors.work_role && (
                <Text className={fieldErrorClassName} testID="profile-edit-work-role-error">
                  {errors.work_role.message}
                </Text>
              )}

              <Text className="text-[#708090] text-sm font-medium mb-1 mt-3">Education</Text>
              <Controller
                control={control}
                name="education"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClassName}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter education"
                    placeholderTextColor="#708090"
                    testID="profile-edit-education"
                  />
                )}
              />
              {errors.education && (
                <Text className={fieldErrorClassName} testID="profile-edit-education-error">
                  {errors.education.message}
                </Text>
              )}

              <Text className="text-[#708090] text-sm font-medium mb-1 mt-3">Timezone</Text>
              <Controller
                control={control}
                name="timezone"
                render={({ field: { value, onChange } }) => (
                  <>
                    <TouchableOpacity
                      className="bg-[#1A2B5C] rounded-xl p-3 flex-row items-center justify-between"
                      onPress={() => setShowTimezonePicker(true)}
                      testID="profile-edit-timezone-button"
                    >
                      <Text className="text-[#F1F5F9] text-base">
                        {getTimezoneLabel(value || deviceTimezone)}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#708090" />
                    </TouchableOpacity>
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
                                className={`px-4 py-3 ${value === tz.value ? 'bg-[#3B82F6]' : 'bg-white'}`}
                                onPress={() => {
                                  onChange(tz.value);
                                  setShowTimezonePicker(false);
                                }}
                                testID={`timezone-option-${tz.value}`}
                              >
                                <Text
                                  className={`text-base ${value === tz.value ? 'text-white font-semibold' : 'text-gray-800'}`}
                                >
                                  {tz.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </RNScrollView>
                        </Pressable>
                      </Pressable>
                    </Modal>
                  </>
                )}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xl font-semibold text-[#E6FAFF] mb-4" testID="profile-edit-goals-title">Goals & Aspirations</Text>

            <View className="bg-[#2B42B6] rounded-2xl p-5 mb-4 shadow-md border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
              <Text className="text-[#708090] text-sm font-medium mb-1">Desires</Text>
              <Controller
                control={control}
                name="desires"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClassName}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="What do you desire to achieve?"
                    placeholderTextColor="#708090"
                    multiline
                    numberOfLines={3}
                    testID="profile-edit-desires"
                  />
                )}
              />
              {errors.desires && (
                <Text className={fieldErrorClassName} testID="profile-edit-desires-error">
                  {errors.desires.message}
                </Text>
              )}

              <Text className="text-[#708090] text-sm font-medium mb-1 mt-3">Limiting Beliefs</Text>
              <Controller
                control={control}
                name="limiting_beliefs"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClassName}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="What beliefs might be holding you back?"
                    placeholderTextColor="#708090"
                    multiline
                    numberOfLines={3}
                    testID="profile-edit-limiting-beliefs"
                  />
                )}
              />
              {errors.limiting_beliefs && (
                <Text className={fieldErrorClassName} testID="profile-edit-limiting-beliefs-error">
                  {errors.limiting_beliefs.message}
                </Text>
              )}
            </View>
          </View>

          <View className="gap-4">
            <PrimaryButton
              title='Save Changes'
              onPress={handleSubmit(onSubmit)}
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
    </LinearGradient>
  );
}
