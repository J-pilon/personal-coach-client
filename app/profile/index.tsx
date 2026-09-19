import { ProfileUpdateData } from '@/api/users';
import ProfileEditForm from '@/components/ProfileEditForm';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useProfile, useUpdateProfile } from '@/hooks/useUser';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <LinearGradient>
        <Text className="text-ink-primary text-lg" testID="profile-loading-text">Loading profile...</Text>
      </LinearGradient>
    );
  }

  if (error || !profile) {
    return (
      <LinearGradient>
        <Text className="text-ink-primary text-lg text-center mb-4" testID="profile-error-text">Failed to load profile</Text>
        <Text className="text-ink-secondary text-center mb-6" testID="profile-error-message">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
      </LinearGradient>
    );
  }

  const handleEditOnSuccess = async (formData: ProfileUpdateData) => {
    try {
      await updateProfile.mutateAsync(formData);
    } catch {
      // apiRequest interceptor surfaces the error toast
    } finally {
      setEditing(false);
    }
  };

  const handleEditOnCancel = () => {
    Alert.alert(
      'Cancel Editing',
      'Are you sure you want to cancel? Your changes will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => setEditing(false) },
      ]
    );
  }

  if (editing && profile) {
    return (
      <ProfileEditForm
        profile={profile}
        onCancel={handleEditOnCancel}
        onSuccess={handleEditOnSuccess}
        isLoading={updateProfile.isPending}
      />
    );
  }

  return (
    <LinearGradient>
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-xl font-semibold text-ink-secondary mb-4" testID="profile-personal-info-title">Personal Information</Text>

          <View className="bg-surface-card rounded-2xl p-5 mb-4 shadow-md border border-accent" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
            <View className="mb-4">
              <Text className="text-ink-muted text-sm font-medium mb-1">Name</Text>
              <Text className="text-ink-primary text-lg font-semibold" testID="profile-name">
                {profile.first_name} {profile.last_name}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-ink-muted text-sm font-medium mb-1">Work Role</Text>
              <Text className="text-ink-secondary text-base" testID="profile-work-role">
                {profile.work_role || 'Not specified'}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-ink-muted text-sm font-medium mb-1">Education</Text>
              <Text className="text-ink-secondary text-base" testID="profile-education">
                {profile.education || 'Not specified'}
              </Text>
            </View>

            <View>
              <Text className="text-ink-muted text-sm font-medium mb-1">Timezone</Text>
              <Text className="text-ink-secondary text-base" testID="profile-timezone">
                {profile.timezone || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-semibold text-ink-secondary mb-4" testID="profile-goals-title">Goals & Aspirations</Text>

          <View className="bg-surface-card rounded-2xl p-5 mb-4 shadow-md border border-accent" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
            <View className="mb-4">
              <Text className="text-ink-muted text-sm font-medium mb-1">Desires</Text>
              <Text className="text-ink-secondary text-base" testID="profile-desires">
                {profile.desires || 'Not specified'}
              </Text>
            </View>

            <View>
              <Text className="text-ink-muted text-sm font-medium mb-1">Limiting Beliefs</Text>
              <Text className="text-ink-secondary text-base" testID="profile-limiting-beliefs">
                {profile.limiting_beliefs || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-semibold text-ink-secondary mb-4" testID="profile-onboarding-title">Onboarding Status</Text>

          <View className="bg-surface-card rounded-2xl p-5 shadow-md border border-accent" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
            <View className="mb-4">
              <View className={`self-start px-4 py-2 rounded-full ${profile.onboarding_status === 'complete' ? 'bg-green-500' : 'bg-orange-500'}`}>
                <Text className="text-sm font-semibold text-white" testID="profile-onboarding-status">
                  {profile.onboarding_status === 'complete' ? 'Complete' : 'Incomplete'}
                </Text>
              </View>
            </View>

            {profile.onboarding_completed_at && (
              <Text className="text-ink-muted text-sm italic" testID="profile-onboarding-completed">
                Completed: {new Date(profile.onboarding_completed_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          className="px-8 py-4 bg-accent rounded-2xl shadow-md"
          onPress={() => setEditing(true)}
          testID="profile-edit-button"
        >
          <Text className="text-ink-onAccent font-semibold text-lg text-center" testID="profile-edit-text">Edit Profile</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
} 