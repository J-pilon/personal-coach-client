import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
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

  const [goalDescription, setGoalDescription] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleCreateGoal = async (): Promise<void> => {
    const validation = validateGoalData(goalDescription, selectedTimeframe);
    if (!validation.isValid) {
      Alert.alert('Error', validation.errorMessage);
      return;
    }

    try {
      await processAiRequest(goalDescription, selectedTimeframe);
      setShowConfirmation(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
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

      Alert.alert(
        'Success!',
        'Your SMART goal has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save goal. Please try again.');
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
