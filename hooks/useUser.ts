import {
  UsersAPI,
  type ProfileUpdateData
} from '@/api/users';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Create a singleton instance of UsersAPI
const usersApi = new UsersAPI();

// Profile hooks
export const useProfile = (profileId?: number) => {
  const { profile: authProfile } = useAuth();
  const currentProfileId = profileId || authProfile?.id;
  
  return useQuery({
    queryKey: ['profile', currentProfileId],
    queryFn: async () => {
      if (!currentProfileId) {
        throw new Error('Profile ID is required');
      }
      const response = await usersApi.getProfile(currentProfileId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!currentProfileId,
  });
};

export const useUpdateProfile = (profileId?: number) => {
  const queryClient = useQueryClient();
  const { profile: authProfile } = useAuth();
  const currentProfileId = profileId || authProfile?.id;
  
  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      if (!currentProfileId) {
        throw new Error('Profile ID is required');
      }
      const response = await usersApi.updateProfile(currentProfileId, data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useCompleteOnboarding = (profileId?: number) => {
  const queryClient = useQueryClient();
  const { profile: authProfile } = useAuth();
  const currentProfileId = profileId || authProfile?.id;
  
  return useMutation({
    mutationFn: async () => {
      if (!currentProfileId) {
        throw new Error('Profile ID is required');
      }
      const response = await usersApi.completeOnboarding(currentProfileId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (updatedProfile) => {
      // Immediately update the cache with the new profile data
      queryClient.setQueryData(['profile', currentProfileId], updatedProfile);
    },
  });
}; 