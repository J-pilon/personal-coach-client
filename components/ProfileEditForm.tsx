import { ProfileUpdateData } from '@/api/users';
import { PrimaryButton, SecondaryButton } from '@/components/buttons/';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useUpdateProfile } from '@/hooks/useUser';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';

interface ProfileEditFormProps {
  profile: {
    id: number;
    first_name?: string;
    last_name?: string;
    work_role?: string;
    education?: string;
    desires?: string;
    limiting_beliefs?: string;
    onboarding_status: 'incomplete' | 'complete';
  };
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function ProfileEditForm({ profile, onCancel, onSuccess }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    work_role: profile.work_role || '',
    education: profile.education || '',
    desires: profile.desires || '',
    limiting_beliefs: profile.limiting_beliefs || '',
  });

  const updateProfile = useUpdateProfile();

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      Alert.alert('Success', 'Profile updated successfully');
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Editing',
      'Are you sure you want to cancel? Your changes will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: onCancel },
      ]
    );
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
              onPress={handleSubmit}
              isLoading={updateProfile.isPending}
              loadingText='Saving...'
              testID='profile-edit-save-button'
              disabled={updateProfile.isPending}
            />

            <SecondaryButton
              title='Cancel'
              onPress={handleCancel}
              testID='profile-edit-cancel-button'
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
} 