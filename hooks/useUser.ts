import {
  completeOnboarding,
  getProfile,
  updateProfile,
  type ProfileUpdateData
} from '@/api/users';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Helper function to get current profile ID
// In a real app, this would come from authentication context
const getCurrentProfileId = () => 1; // Default to profile 1 for now

// Profile hooks
export const useProfile = (profileId?: number) => {
  const currentProfileId = profileId || getCurrentProfileId();
  
  return useQuery({
    queryKey: ['profile', currentProfileId],
    queryFn: () => getProfile(currentProfileId),
  });
};

export const useUpdateProfile = (profileId?: number) => {
  const queryClient = useQueryClient();
  const currentProfileId = profileId || getCurrentProfileId();
  
  return useMutation({
    mutationFn: (data: ProfileUpdateData) => updateProfile(currentProfileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useCompleteOnboarding = (profileId?: number) => {
  const queryClient = useQueryClient();
  const currentProfileId = profileId || getCurrentProfileId();
  
  return useMutation({
    mutationFn: () => completeOnboarding(currentProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}; 