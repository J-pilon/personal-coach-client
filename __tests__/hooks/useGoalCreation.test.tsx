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

    expect(result.current.goalDescription).toBe('');
    expect(result.current.selectedTimeframe).toBe('');
    expect(result.current.showConfirmation).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.aiResponse).toBe(null);
  });

  it('should update goal description', () => {
    const { result } = renderHook(() => useGoalCreation());

    act(() => {
      result.current.setGoalDescription('Learn React Native');
    });

    expect(result.current.goalDescription).toBe('Learn React Native');
  });

  it('should update selected timeframe', () => {
    const { result } = renderHook(() => useGoalCreation());

    act(() => {
      result.current.setSelectedTimeframe('3 months');
    });

    expect(result.current.selectedTimeframe).toBe('3 months');
  });

  it('should update show confirmation', () => {
    const { result } = renderHook(() => useGoalCreation());

    act(() => {
      result.current.setShowConfirmation(true);
    });

    expect(result.current.showConfirmation).toBe(true);
  });

  describe('handleCreateGoal', () => {
    it('should call processAiRequest when validation passes', async () => {
      const { result } = renderHook(() => useGoalCreation());

      act(() => {
        result.current.setGoalDescription('Learn React Native');
        result.current.setSelectedTimeframe('3 months');
      });

      await act(async () => {
        await result.current.handleCreateGoal();
      });

      expect(mockProcessAiRequest).toHaveBeenCalledWith('Learn React Native', '3 months');
      expect(result.current.showConfirmation).toBe(true);
    });

    it('should show error alert when goal description is empty', async () => {
      const { result } = renderHook(() => useGoalCreation());

      act(() => {
        result.current.setSelectedTimeframe('3 months');
      });

      await act(async () => {
        await result.current.handleCreateGoal();
      });

      expect(mockToastError).toHaveBeenCalledWith('Please enter a goal description');
      expect(mockProcessAiRequest).not.toHaveBeenCalled();
    });

    it('should show error alert when timeframe is not selected', async () => {
      const { result } = renderHook(() => useGoalCreation());

      act(() => {
        result.current.setGoalDescription('Learn React Native');
      });

      await act(async () => {
        await result.current.handleCreateGoal();
      });

      expect(mockToastError).toHaveBeenCalledWith('Please select a timeframe');
      expect(mockProcessAiRequest).not.toHaveBeenCalled();
    });

    it('should not throw when AI request fails (interceptor surfaces toast)', async () => {
      const { result } = renderHook(() => useGoalCreation());

      mockProcessAiRequest.mockRejectedValue(new Error('AI request failed'));

      act(() => {
        result.current.setGoalDescription('Learn React Native');
        result.current.setSelectedTimeframe('3 months');
      });

      await act(async () => {
        await result.current.handleCreateGoal();
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

      act(() => {
        result.current.setGoalDescription('Learn React Native');
        result.current.setSelectedTimeframe('3 months');
      });

      await act(async () => {
        await result.current.handleConfirmGoal();
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
        await result.current.handleConfirmGoal();
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
