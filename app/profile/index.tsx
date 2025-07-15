import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useProfile, useUpdateProfile } from '@/hooks/useUser';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#021A40] justify-center items-center">
        <Text className="text-[#F1F5F9] text-lg">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-[#021A40] justify-center items-center px-6">
        <Text className="text-[#F1F5F9] text-lg text-center mb-4">Failed to load profile</Text>
        <Text className="text-[#E6FAFF] text-center mb-6">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#021A40]">
      <ScrollView className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-[28px] font-semibold text-center text-[#F1F5F9] tracking-wide">Profile</Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-semibold text-[#E6FAFF] mb-4">Personal Information</Text>

          <View className="bg-[#13203a] rounded-2xl p-5 mb-4 shadow-md border border-[#33CFFF]">
            <View className="mb-4">
              <Text className="text-[#708090] text-sm font-medium mb-1">Name</Text>
              <Text className="text-[#F1F5F9] text-lg font-semibold">
                {profile.first_name} {profile.last_name}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-[#708090] text-sm font-medium mb-1">Work Role</Text>
              <Text className="text-[#E6FAFF] text-base">
                {profile.work_role || 'Not specified'}
              </Text>
            </View>

            <View>
              <Text className="text-[#708090] text-sm font-medium mb-1">Education</Text>
              <Text className="text-[#E6FAFF] text-base">
                {profile.education || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-semibold text-[#E6FAFF] mb-4">Goals & Aspirations</Text>

          <View className="bg-[#13203a] rounded-2xl p-5 mb-4 shadow-md border border-[#33CFFF]">
            <View className="mb-4">
              <Text className="text-[#708090] text-sm font-medium mb-1">Desires</Text>
              <Text className="text-[#E6FAFF] text-base">
                {profile.desires || 'Not specified'}
              </Text>
            </View>

            <View>
              <Text className="text-[#708090] text-sm font-medium mb-1">Limiting Beliefs</Text>
              <Text className="text-[#E6FAFF] text-base">
                {profile.limiting_beliefs || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-semibold text-[#E6FAFF] mb-4">Onboarding Status</Text>

          <View className="bg-[#13203a] rounded-2xl p-5 shadow-md border border-[#33CFFF]">
            <View className="mb-4">
              <View className={`self-start px-4 py-2 rounded-full ${profile.onboarding_status === 'complete' ? 'bg-green-500' : 'bg-orange-500'}`}>
                <Text className="text-white font-semibold text-sm">
                  {profile.onboarding_status === 'complete' ? 'Complete' : 'Incomplete'}
                </Text>
              </View>
            </View>

            {profile.onboarding_completed_at && (
              <Text className="text-[#708090] text-sm italic">
                Completed: {new Date(profile.onboarding_completed_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          className="bg-[#33CFFF] py-4 px-8 rounded-2xl shadow-md"
          onPress={() => {
            // TODO: Navigate to edit profile screen
            console.log('Edit profile pressed');
          }}
        >
          <Text className="text-[#021A40] font-semibold text-lg text-center">Edit Profile</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
} 