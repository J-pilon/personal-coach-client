import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import { GoalDescriptionInput } from '../../components/goals/GoalDescriptionInput';
import { GoalPreviewCard } from '../../components/goals/GoalPreviewCard';
import { TimeframeSelector } from '../../components/goals/TimeframeSelector';
import LoadingSpinner from '../../components/LoadingSpinner';
import LinearGradient from '../../components/ui/LinearGradient';
import ScrollView from '../../components/util/ScrollView';
import { useGoalCreation } from '../../hooks/useGoalCreation';
import { TIMEFRAME_OPTIONS, formatTimeframeForAiResponse } from '../../utils/smartGoalFormatters';

export default function AddGoalScreen() {
  const {
    goalDescription,
    selectedTimeframe,
    setGoalDescription,
    setSelectedTimeframe,
    handleCreateGoal,
    handleConfirmGoal,
    handleEditGoal,
    handleCancel,
    isLoading,
    aiResponse,
  } = useGoalCreation();

  if (isLoading) {
    return (
      <LoadingSpinner
        variant="fullscreen"
        text="AI is crafting your SMART goal..."
        size="large"
        testID="goal-creation-loading"
      />
    );
  }

  if (!isLoading && aiResponse) {
    return (
      <LinearGradient>
        <ScrollView className="flex-1 px-6 pt-16">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <Text className="text-2xl font-semibold text-[#F1F5F9]">
              Confirm Your Goal
            </Text>
          </View>

          {/* Goal Preview Card */}
          <GoalPreviewCard
            goalData={formatTimeframeForAiResponse(selectedTimeframe, aiResponse)}
            testID="add-goal-preview-card"
          />

          {/* Action Buttons */}
          <View className="mb-8 space-y-4">
            <PrimaryButton
              onPress={handleConfirmGoal}
              title="Confirm & Save Goal"
              testID="confirm-goal-button"
            />
            <SecondaryButton
              onPress={handleEditGoal}
              title="Edit Goal"
              testID="edit-goal-button"
            />
            <SecondaryButton
              onPress={handleCancel}
              title="Cancel"
              testID="cancel-goal-button"
            />
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient>
      <ScrollView className="flex-1 px-6 pt-16">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center mb-6">
            <Text className="text-2xl font-semibold text-[#F1F5F9]">
              Create New Goal
            </Text>
          </View>

          <View className="p-6 bg-[#2B42B6] rounded-2xl shadow-lg border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
            <View className="flex-row items-center mb-3">
              <View className="p-2 mr-3 bg-cyan-400 rounded-full">
                <Ionicons name="flag" size={20} color="#021A40" />
              </View>
              <Text className="text-[#F1F5F9] text-base font-semibold">
                Let&apos;s create a SMART goal together
              </Text>
            </View>
            <Text className="text-[#E6FAFF] text-sm leading-5">
              Describe what you want to achieve and we&apos;ll help you break it down into specific, measurable, achievable, relevant, and time-bound objectives.
            </Text>
          </View>
        </View>

        {/* Goal Description Input */}
        <GoalDescriptionInput
          value={goalDescription}
          onChangeText={setGoalDescription}
          testID="add-goal-description-input"
        />

        {/* Timeframe Selection */}
        <TimeframeSelector
          options={TIMEFRAME_OPTIONS}
          selectedTimeframe={selectedTimeframe}
          onTimeframeSelect={setSelectedTimeframe}
          testID="add-goal-timeframe-selector"
        />

        <View className="mb-8">
          <PrimaryButton
            onPress={handleCreateGoal}
            title={isLoading ? 'Creating Goal...' : 'Create SMART Goal'}
            disabled={isLoading || !goalDescription.trim() || !selectedTimeframe}
            testID="create-goal-button"
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
