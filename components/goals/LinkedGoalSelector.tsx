import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface GoalOption {
  id?: number;
  title: string;
}

interface LinkedGoalSelectorProps {
  goals: GoalOption[];
  isLoading: boolean;
  selectedGoalId: number | null;
  onSelectGoal: (goalId: number | null) => void;
  disabled?: boolean;
}

export function LinkedGoalSelector({
  goals,
  isLoading,
  selectedGoalId,
  onSelectGoal,
  disabled = false,
}: LinkedGoalSelectorProps) {
  return (
    <View className="mb-5" testID="add-task-goal-linking-section">
      <Text className="text-ink-secondary text-base mb-3 font-medium">Linked Goal (optional):</Text>
      {isLoading ? (
        <Text className="text-ink-muted text-sm" testID="add-task-goal-loading">
          Loading goals...
        </Text>
      ) : (
        <View className="gap-2">
          {goals.map(goal => (
            <Pressable
              key={goal.id}
              onPress={() => onSelectGoal(goal.id ?? null)}
              className={`py-3 px-4 rounded-lg border ${selectedGoalId === goal.id
                ? 'border-accent bg-accent'
                : 'border-border-muted bg-surface-input'
                }`}
              disabled={disabled}
              testID={`add-task-goal-option-${goal.id}`}
            >
              <Text
                className={`font-medium ${selectedGoalId === goal.id
                  ? 'text-ink-onAccent'
                  : 'text-ink-secondary'
                  }`}
              >
                {goal.title}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={() => onSelectGoal(null)}
            className={`py-3 px-4 rounded-lg border ${selectedGoalId === null
              ? 'border-accent bg-accent'
              : 'border-border-muted bg-surface-input'
              }`}
            disabled={disabled}
            testID="add-task-goal-option-none"
          >
            <Text
              className={`font-medium ${selectedGoalId === null
                ? 'text-ink-onAccent'
                : 'text-ink-secondary'
                }`}
            >
              None
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
