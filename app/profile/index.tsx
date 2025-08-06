import ProfileEditForm from '@/components/ProfileEditForm';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useProfile } from '@/hooks/useUser';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { data: profile, isLoading, error } = useProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <LinearGradient>
        <Text className="text-[#F1F5F9] text-lg" testID="profile-loading-text">Loading profile...</Text>
      </LinearGradient>
    );
  }

  if (error || !profile) {
    return (
      <LinearGradient>
        <Text className="text-[#F1F5F9] text-lg text-center mb-4" testID="profile-error-text">Failed to load profile</Text>
        <Text className="text-[#E6FAFF] text-center mb-6" testID="profile-error-message">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
      </LinearGradient>
    );
  }



  if (editing && profile) {
    return (
      <ProfileEditForm
        profile={profile}
        onCancel={() => setEditing(false)}
        onSuccess={() => setEditing(false)}
      />
    );
  }

  return (
    <LinearGradient>
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-xl font-semibold text-[#E6FAFF] mb-4" testID="profile-personal-info-title">Personal Information</Text>

          <View className="bg-[#2B42B6] rounded-2xl p-5 mb-4 shadow-md border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
            <View className="mb-4">
              <Text className="text-[#708090] text-sm font-medium mb-1">Name</Text>
              <Text className="text-[#F1F5F9] text-lg font-semibold" testID="profile-name">
                {profile.first_name} {profile.last_name}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-[#708090] text-sm font-medium mb-1">Work Role</Text>
              <Text className="text-[#E6FAFF] text-base" testID="profile-work-role">
                {profile.work_role || 'Not specified'}
              </Text>
            </View>

            <View>
              <Text className="text-[#708090] text-sm font-medium mb-1">Education</Text>
              <Text className="text-[#E6FAFF] text-base" testID="profile-education">
                {profile.education || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-semibold text-[#E6FAFF] mb-4" testID="profile-goals-title">Goals & Aspirations</Text>

          <View className="bg-[#2B42B6] rounded-2xl p-5 mb-4 shadow-md border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
            <View className="mb-4">
              <Text className="text-[#708090] text-sm font-medium mb-1">Desires</Text>
              <Text className="text-[#E6FAFF] text-base" testID="profile-desires">
                {profile.desires || 'Not specified'}
              </Text>
            </View>

            <View>
              <Text className="text-[#708090] text-sm font-medium mb-1">Limiting Beliefs</Text>
              <Text className="text-[#E6FAFF] text-base" testID="profile-limiting-beliefs">
                {profile.limiting_beliefs || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-semibold text-[#E6FAFF] mb-4" testID="profile-onboarding-title">Onboarding Status</Text>

          <View className="bg-[#2B42B6] rounded-2xl p-5 shadow-md border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
            <View className="mb-4">
              <View className={`self-start px-4 py-2 rounded-full ${profile.onboarding_status === 'complete' ? 'bg-green-500' : 'bg-orange-500'}`}>
                <Text className="text-sm font-semibold text-white" testID="profile-onboarding-status">
                  {profile.onboarding_status === 'complete' ? 'Complete' : 'Incomplete'}
                </Text>
              </View>
            </View>

            {profile.onboarding_completed_at && (
              <Text className="text-[#708090] text-sm italic" testID="profile-onboarding-completed">
                Completed: {new Date(profile.onboarding_completed_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          className="px-8 py-4 bg-cyan-400 rounded-2xl shadow-md"
          onPress={() => setEditing(true)}
          testID="profile-edit-button"
        >
          <Text className="text-[#021A40] font-semibold text-lg text-center" testID="profile-edit-text">Edit Profile</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
} 