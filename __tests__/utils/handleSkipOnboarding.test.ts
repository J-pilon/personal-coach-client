import * as SecureStore from 'expo-secure-store';
import { isOnboardingSkippable, setSkippedOnboarding } from '../../utils/handleSkipOnboarding';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
}));

describe('handleSkipOnboarding', () => {
  const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
  const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setSkippedOnboarding', () => {
    it('sets the skipped onboarding timestamp', async () => {
      mockSetItemAsync.mockResolvedValue(undefined);

      await setSkippedOnboarding();

      expect(mockSetItemAsync).toHaveBeenCalledWith('skipped_onboarding_at', expect.any(String));
      
      const timestamp = mockSetItemAsync.mock.calls[0][1];
      expect(new Date(timestamp).getTime()).toBeCloseTo(Date.now(), -2); // Within 100ms
    });

    it('handles errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSetItemAsync.mockRejectedValue(new Error('Storage error'));

      await setSkippedOnboarding();

      expect(consoleSpy).toHaveBeenCalledWith('Error setting skipped onboarding timestamp:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('isOnboardingSkippable', () => {
    it('returns false when no timestamp is stored', async () => {
      mockGetItemAsync.mockResolvedValue(null);

      const result = await isOnboardingSkippable();

      expect(result).toBe(false);
      expect(mockGetItemAsync).toHaveBeenCalledWith('skipped_onboarding_at');
    });

    it('returns true when timestamp is less than 24 hours old', async () => {
      const recentTimestamp = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(); // 12 hours ago
      mockGetItemAsync.mockResolvedValue(recentTimestamp);

      const result = await isOnboardingSkippable();

      expect(result).toBe(true);
    });

    it('returns false when timestamp is more than 24 hours old', async () => {
      const oldTimestamp = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
      mockGetItemAsync.mockResolvedValue(oldTimestamp);

      const result = await isOnboardingSkippable();

      expect(result).toBe(false);
    });

    it('returns false when timestamp is exactly 24 hours old', async () => {
      const exactTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Exactly 24 hours ago
      mockGetItemAsync.mockResolvedValue(exactTimestamp);

      const result = await isOnboardingSkippable();

      expect(result).toBe(false);
    });

    it('handles invalid timestamp gracefully', async () => {
      mockGetItemAsync.mockResolvedValue('invalid-date');

      const result = await isOnboardingSkippable();

      // Invalid date results in NaN, which makes hoursDiff NaN, which is not < 24, so returns false
      expect(result).toBe(false);
    });

    it('handles storage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetItemAsync.mockRejectedValue(new Error('Storage error'));

      const result = await isOnboardingSkippable();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error checking onboarding skip expiration:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('handles empty string timestamp', async () => {
      mockGetItemAsync.mockResolvedValue('');

      const result = await isOnboardingSkippable();

      expect(result).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('sets and retrieves timestamp correctly', async () => {
      mockSetItemAsync.mockResolvedValue(undefined);
      mockGetItemAsync.mockResolvedValue(null);

      // Initially no timestamp
      let result = await isOnboardingSkippable();
      expect(result).toBe(false);

      // Set timestamp
      await setSkippedOnboarding();
      expect(mockSetItemAsync).toHaveBeenCalled();

      // Mock the stored timestamp
      const storedTimestamp = mockSetItemAsync.mock.calls[0][1];
      mockGetItemAsync.mockResolvedValue(storedTimestamp);

      // Should be skippable immediately after setting (less than 24 hours)
      result = await isOnboardingSkippable();
      expect(result).toBe(true);
    });

    it('handles edge case of exactly 24 hours', async () => {
      const now = new Date();
      const exactly24HoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      mockGetItemAsync.mockResolvedValue(exactly24HoursAgo);

      const result = await isOnboardingSkippable();

      expect(result).toBe(false);
    });
  });
}); 