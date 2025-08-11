import { act, renderHook } from '@testing-library/react';
import { Alert } from 'react-native';
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
      aiResponse: null
    });

    mockUseCreateSmartGoal.mockReturnValue({
      mutateAsync: mockCreateSmartGoal
    });

    // Mock Alert.alert
    jest.spyOn(Alert, 'alert').mockImplementation(() => { });
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

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a goal description');
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

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a timeframe');
      expect(mockProcessAiRequest).not.toHaveBeenCalled();
    });

    it('should show error alert when AI request fails', async () => {
      const { result } = renderHook(() => useGoalCreation());

      mockProcessAiRequest.mockRejectedValue(new Error('AI request failed'));

      act(() => {
        result.current.setGoalDescription('Learn React Native');
        result.current.setSelectedTimeframe('3 months');
      });

      await act(async () => {
        await result.current.handleCreateGoal();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create goal. Please try again.');
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
        aiResponse: mockAiResponse
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

    it('should show error alert when AI response is missing', async () => {
      const { result } = renderHook(() => useGoalCreation());

      await act(async () => {
        await result.current.handleConfirmGoal();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save goal. Please try again.');
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
