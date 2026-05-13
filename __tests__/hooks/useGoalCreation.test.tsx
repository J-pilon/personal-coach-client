import { act, renderHook } from '@testing-library/react-native';
import { useAiProxy } from '../../hooks/useAiProxy';
import { useGoalCreation } from '../../hooks/useGoalCreation';
import { useCreateSmartGoal } from '../../hooks/useSmartGoals';

// Mock the dependencies
jest.mock('../../hooks/useAiProxy');
jest.mock('../../hooks/useSmartGoals');
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn()
  }
}));

// Mock toast
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock('../../components/ToastManager', () => ({
  useToast: () => ({
    error: mockToastError,
    success: mockToastSuccess,
    info: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

const mockUseAiProxy = useAiProxy as jest.MockedFunction<typeof useAiProxy>;
const mockUseCreateSmartGoal = useCreateSmartGoal as jest.MockedFunction<typeof useCreateSmartGoal>;

describe('useGoalCreation', () => {
  const mockProcessAiRequest = jest.fn();
  const mockCreateSmartGoal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAiProxy.mockReturnValue({
      processAiRequest: mockProcessAiRequest,
      isLoading: false,
      aiResponse: null,
      usageInfo: null,
      jobStatus: null,
      error: null,
      progress: 0,
      isJobComplete: false,
      isJobFailed: false
    });

    mockUseCreateSmartGoal.mockReturnValue({
      mutateAsync: mockCreateSmartGoal,
      data: undefined,
      error: null,
      variables: undefined,
      isError: false,
      isSuccess: false,
      isPending: false,
      isIdle: true,
      status: 'idle',
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      submittedAt: 0,
      reset: jest.fn(),
      mutate: jest.fn()
    });

  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGoalCreation());

    expect(result.current.showConfirmation).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.aiResponse).toBe(null);
  });

  it('should update show confirmation', () => {
    const { result } = renderHook(() => useGoalCreation());

    act(() => {
      result.current.setShowConfirmation(true);
    });

    expect(result.current.showConfirmation).toBe(true);
  });

  describe('handleCreateGoal', () => {
    it('should call processAiRequest with provided values', async () => {
      const { result } = renderHook(() => useGoalCreation());

      await act(async () => {
        await result.current.handleCreateGoal('Learn React Native', '3 months');
      });

      expect(mockProcessAiRequest).toHaveBeenCalledWith('Learn React Native', '3 months');
      expect(result.current.showConfirmation).toBe(true);
    });

    it('should not throw when AI request fails (interceptor surfaces toast)', async () => {
      const { result } = renderHook(() => useGoalCreation());

      mockProcessAiRequest.mockRejectedValue(new Error('AI request failed'));

      await act(async () => {
        await result.current.handleCreateGoal('Learn React Native', '3 months');
      });

      expect(mockProcessAiRequest).toHaveBeenCalled();
      expect(result.current.showConfirmation).toBe(false);
    });
  });

  describe('handleConfirmGoal', () => {
    it('should create smart goal when AI response is available', async () => {
      const mockAiResponse = {
        response: {
          three_month: {
            specific: 'Learn React Native in 3 months',
            measurable: 'Complete 3 projects',
            achievable: 'Study 2 hours daily',
            relevant: 'Advance career in mobile development',
            time_bound: 'Complete by end of 3 months'
          }
        }
      };

      mockUseAiProxy.mockReturnValue({
        processAiRequest: mockProcessAiRequest,
        isLoading: false,
        aiResponse: mockAiResponse,
        usageInfo: null,
        jobStatus: null,
        error: null,
        progress: 0,
        isJobComplete: false,
        isJobFailed: false
      });

      const { result } = renderHook(() => useGoalCreation());

      await act(async () => {
        await result.current.handleConfirmGoal('Learn React Native', '3 months');
      });

      expect(mockCreateSmartGoal).toHaveBeenCalledWith({
        title: 'Learn React Native in 3 months',
        description: 'Learn React Native',
        timeframe: '3_months',
        specific: 'Learn React Native in 3 months',
        measurable: 'Complete 3 projects',
        achievable: 'Study 2 hours daily',
        relevant: 'Advance career in mobile development',
        time_bound: 'Complete by end of 3 months'
      });
    });

    it('should show error toast when AI response is missing', async () => {
      const { result } = renderHook(() => useGoalCreation());

      await act(async () => {
        await result.current.handleConfirmGoal('Learn React Native', '3 months');
      });

      expect(mockToastError).toHaveBeenCalledWith('No goal details available');
      expect(mockCreateSmartGoal).not.toHaveBeenCalled();
    });
  });

  describe('handleEditGoal', () => {
    it('should hide confirmation', () => {
      const { result } = renderHook(() => useGoalCreation());

      act(() => {
        result.current.setShowConfirmation(true);
      });

      expect(result.current.showConfirmation).toBe(true);

      act(() => {
        result.current.handleEditGoal();
      });

      expect(result.current.showConfirmation).toBe(false);
    });
  });

  describe('handleCancel', () => {
    it('should hide confirmation when showing confirmation', () => {
      const { result } = renderHook(() => useGoalCreation());

      act(() => {
        result.current.setShowConfirmation(true);
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.showConfirmation).toBe(false);
    });
  });
});
