import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUser, 
  getProfile, 
  updateProfile, 
  completeOnboarding, 
  createUser,
  type UserResponse, 
  type Profile, 
  type ProfileUpdateData,
  type UserRegistrationData
} from '@/api/users';

// Helper function to get current user/profile IDs
// In a real app, this would come from authentication context
const getCurrentUserId = () => 1; // Default to user 1 for now
const getCurrentProfileId = () => 1; // Default to profile 1 for now

// User authentication hooks
export const useUser = (userId?: number) => {
  const currentUserId = userId || getCurrentUserId();
  
  return useQuery({
    queryKey: ['user', currentUserId],
    queryFn: () => getUser(currentUserId),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

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