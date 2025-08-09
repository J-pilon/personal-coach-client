import * as SecureStore from 'expo-secure-store';

const SKIPPED_ONBOARDING_KEY = 'skipped_onboarding_at';

/**
 * Sets the skipped_onboarding_at timestamp to the current datetime
 */
export const setSkippedOnboarding = async (): Promise<void> => {
  const currentTimestamp = new Date().toISOString();

  try {
    await SecureStore.setItemAsync(SKIPPED_ONBOARDING_KEY, currentTimestamp);
  } catch (error) {
    console.error('Error setting skipped onboarding timestamp:', error);
  }
};

export const clearSkippedOnboarding = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SKIPPED_ONBOARDING_KEY);
    console.log('Cleared skipped onboarding timestamp')
  } catch (error) {
    console.error('Error clearing skipped onboarding timestamp:', error);
  }
}

/**
 * Checks if the current datetime is 24 hours past the skipped_onboarding_at datetime
 * @returns true if 24 hours have passed since skip, false otherwise
 */
export const isOnboardingSkippable = async (): Promise<boolean> => {
  try {
    const skippedTimestamp = await SecureStore.getItemAsync(SKIPPED_ONBOARDING_KEY);

    if (!skippedTimestamp) {
      return false;
    }
    
    const skippedDate = new Date(skippedTimestamp);
    const currentDate = new Date();
    const hoursDiff = (currentDate.getTime() - skippedDate.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 24;
  } catch (error) {
    console.error('Error checking onboarding skip expiration:', error);
    return false; // Default to false on error
  }
};