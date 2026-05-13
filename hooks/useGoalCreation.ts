import { router } from 'expo-router';
import { useState } from 'react';
import { useToast } from '../components/ToastManager';
import {
  formatTimeframeForAiResponse,
  getServerTimeframe
} from '../utils/smartGoalFormatters';
import { useAiProxy } from './useAiProxy';
import { useCreateSmartGoal } from './useSmartGoals';

export interface GoalCreationState {
  showConfirmation: boolean;
  isLoading: boolean;
  aiResponse: any;
}

export interface GoalCreationActions {
  setShowConfirmation: (show: boolean) => void;
  handleCreateGoal: (description: string, timeframe: string) => Promise<void>;
  handleConfirmGoal: (description: string, timeframe: string) => Promise<void>;
  handleEditGoal: () => void;
  handleCancel: () => void;
}

export const useGoalCreation = (): GoalCreationActions & GoalCreationState => {
  const { mutateAsync: createSmartGoal } = useCreateSmartGoal();
  const { processAiRequest, isLoading, aiResponse } = useAiProxy();
  const toast = useToast();

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleCreateGoal = async (description: string, timeframe: string): Promise<void> => {
    try {
      await processAiRequest(description, timeframe);
      setShowConfirmation(true);
    } catch {
      // apiRequest interceptor surfaces the error toast
    }
  };

  const handleConfirmGoal = async (description: string, timeframe: string): Promise<void> => {
    try {
      if (!aiResponse) {
        throw new Error('No goal details available');
      }

      const formattedResponse = formatTimeframeForAiResponse(timeframe, aiResponse);
      const serverTimeframe = getServerTimeframe(timeframe);

      await createSmartGoal({
        title: formattedResponse.specific,
        description,
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
    showConfirmation,
    isLoading,
    aiResponse,
    setShowConfirmation,
    handleCreateGoal,
    handleConfirmGoal,
    handleEditGoal,
    handleCancel,
  };
};
