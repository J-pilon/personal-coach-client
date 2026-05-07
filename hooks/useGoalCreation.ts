import { router } from 'expo-router';
import { useState } from 'react';
import { useToast } from '../components/ToastManager';
import {
  formatTimeframeForAiResponse,
  getServerTimeframe,
  validateGoalData
} from '../utils/smartGoalFormatters';
import { useAiProxy } from './useAiProxy';
import { useCreateSmartGoal } from './useSmartGoals';

export interface GoalCreationState {
  goalDescription: string;
  selectedTimeframe: string;
  showConfirmation: boolean;
  isLoading: boolean;
  aiResponse: any;
}

export interface GoalCreationActions {
  setGoalDescription: (description: string) => void;
  setSelectedTimeframe: (timeframe: string) => void;
  setShowConfirmation: (show: boolean) => void;
  handleCreateGoal: () => Promise<void>;
  handleConfirmGoal: () => Promise<void>;
  handleEditGoal: () => void;
  handleCancel: () => void;
}

export const useGoalCreation = (): GoalCreationActions & GoalCreationState => {
  const { mutateAsync: createSmartGoal } = useCreateSmartGoal();
  const { processAiRequest, isLoading, aiResponse } = useAiProxy();
  const toast = useToast();

  const [goalDescription, setGoalDescription] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleCreateGoal = async (): Promise<void> => {
    const validation = validateGoalData(goalDescription, selectedTimeframe);
    if (!validation.isValid) {
      toast.error(validation.errorMessage ?? 'Invalid goal data');
      return;
    }

    try {
      await processAiRequest(goalDescription, selectedTimeframe);
      setShowConfirmation(true);
    } catch {
      // apiRequest interceptor surfaces the error toast
    }
  };

  const handleConfirmGoal = async (): Promise<void> => {
    try {
      if (!aiResponse) {
        throw new Error('No goal details available');
      }

      const formattedResponse = formatTimeframeForAiResponse(selectedTimeframe, aiResponse);
      const serverTimeframe = getServerTimeframe(selectedTimeframe);

      await createSmartGoal({
        title: formattedResponse.specific,
        description: goalDescription,
        timeframe: serverTimeframe,
        specific: formattedResponse.specific,
        measurable: formattedResponse.measurable,
        achievable: formattedResponse.achievable,
        relevant: formattedResponse.relevant,
        time_bound: formattedResponse.time_bound
      });

      toast.success('Your SMART goal has been created successfully.');
      router.back();
    } catch (error) {
      // apiRequest interceptor surfaces API error toasts; surface non-API failures (e.g., missing aiResponse)
      if (error instanceof Error && error.message === 'No goal details available') {
        toast.error(error.message);
      }
    }
  };

  const handleEditGoal = (): void => {
    setShowConfirmation(false);
  };

  const handleCancel = (): void => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else {
      router.back();
    }
  };

  return {
    // State
    goalDescription,
    selectedTimeframe,
    showConfirmation,
    isLoading,
    aiResponse,
    
    // Actions
    setGoalDescription,
    setSelectedTimeframe,
    setShowConfirmation,
    handleCreateGoal,
    handleConfirmGoal,
    handleEditGoal,
    handleCancel,
  };
};
