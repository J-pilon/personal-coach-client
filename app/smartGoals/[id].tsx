import { type Task } from '@/api/tasks';
import { PrimaryButton } from '@/components/buttons/';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/loading';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useSmartGoal } from '@/hooks/useSmartGoals';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function GoalDetailScreen() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goalId = parseInt(id || '0', 10);

  return (
    <ErrorBoundary
      scope="goal-detail"
      onReset={() => queryClient.invalidateQueries({ queryKey: ['smartGoal', goalId] })}
    >
      <GoalDetailContent goalId={goalId} />
    </ErrorBoundary>
  );
}

function GoalDetailContent({ goalId }: { goalId: number }) {
  const { data: goal, isLoading, error } = useSmartGoal(goalId);

  if (isLoading) {
    return (
      <LinearGradient>
        <LoadingSpinner
          size="large"
          text="Loading goal..."
          variant="fullscreen"
          testID="goal-detail-loading"
        />
      </LinearGradient>
    );
  }

  if (error || !goal) {
    return (
      <LinearGradient>
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-[#F1F5F9] text-lg text-center mb-4" testID="goal-detail-error-title">
            Could not load goal
          </Text>
          <Text className="text-[#E6FAFF] text-center mb-6" testID="goal-detail-error-message">
            {error instanceof Error ? error.message : 'Goal not found.'}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const openTasks = goal.tasks?.open ?? [];
  const completedTasks = goal.tasks?.completed ?? [];
  const hasAnyTasks = openTasks.length > 0 || completedTasks.length > 0;

  return (
    <LinearGradient>
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="bg-[#2B42B6] rounded-2xl p-5 mb-6 shadow-lg border border-[#33CFFF]" style={cardShadow}>
          <View className="flex-row justify-between items-start mb-4">
            <Text
              className="text-2xl font-semibold text-[#F1F5F9] flex-1 mr-4"
              testID="goal-detail-title"
            >
              {goal.title}
            </Text>
            <View className={`px-3 py-1 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-orange-500'}`}>
              <Text className="text-sm font-semibold text-white" testID="goal-detail-status">
                {goal.completed ? 'Complete' : 'In Progress'}
              </Text>
            </View>
          </View>

          {goal.target_date ? (
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={16} color="#E6FAFF" />
              <Text className="text-[#E6FAFF] text-base ml-2" testID="goal-detail-target-date">
                Target: {formatTargetDate(goal.target_date)}
              </Text>
            </View>
          ) : null}

          {goal.description ? (
            <Text className="text-[#E6FAFF] text-base mt-2" testID="goal-detail-description">
              {goal.description}
            </Text>
          ) : null}
        </View>

        <View className="bg-[#2B42B6] rounded-2xl p-5 mb-6 shadow-lg border border-[#33CFFF]" style={cardShadow}>
          <Text className="text-lg font-semibold text-[#F1F5F9] mb-4">SMART Breakdown</Text>
          <SmartField label="Specific" value={goal.specific} testID="goal-detail-specific" />
          <SmartField label="Measurable" value={goal.measurable} testID="goal-detail-measurable" />
          <SmartField label="Achievable" value={goal.achievable} testID="goal-detail-achievable" />
          <SmartField label="Relevant" value={goal.relevant} testID="goal-detail-relevant" />
          <SmartField label="Time-bound" value={goal.time_bound} testID="goal-detail-time-bound" last />
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-semibold text-[#F1F5F9]" testID="goal-detail-open-heading">
              Open Tasks ({openTasks.length})
            </Text>
          </View>
          {openTasks.length === 0 ? (
            <EmptyTaskState
              message={hasAnyTasks ? 'No open tasks for this goal.' : 'No tasks linked to this goal yet.'}
              testID="goal-detail-open-empty"
            />
          ) : (
            openTasks.map(task => <TaskRow key={task.id} task={task} />)
          )}
        </View>

        {completedTasks.length > 0 ? (
          <View className="mb-6">
            <Text className="text-xl font-semibold text-[#F1F5F9] mb-3" testID="goal-detail-completed-heading">
              Completed ({completedTasks.length})
            </Text>
            {completedTasks.map(task => <TaskRow key={task.id} task={task} muted />)}
          </View>
        ) : null}

        <PrimaryButton
          title="Add Task to This Goal"
          icon="add"
          onPress={() => router.push({ pathname: '/addTask', params: { smartGoalId: String(goalId) } })}
          className="flex-row-reverse gap-2 mb-8"
          testID="goal-detail-add-task-button"
        />
      </ScrollView>
    </LinearGradient>
  );
}

function SmartField({ label, value, testID, last }: { label: string; value?: string; testID: string; last?: boolean }) {
  if (!value) return null;
  return (
    <View className={last ? '' : 'mb-3'}>
      <Text className="text-[#708090] text-sm font-medium mb-1">{label}:</Text>
      <Text className="text-[#E6FAFF] text-base" testID={testID}>{value}</Text>
    </View>
  );
}

function TaskRow({ task, muted }: { task: Task; muted?: boolean }) {
  return (
    <Pressable
      className="flex-row justify-between items-center bg-[#2B42B6] rounded-xl p-4 mb-2 border border-[#33CFFF]"
      style={cardShadow}
      onPress={() => task.id && router.push(`/taskDetail/${task.id}`)}
      testID={`goal-detail-task-${task.id}`}
    >
      <View className="flex-1 mr-3">
        <Text
          className={`text-base font-medium ${muted ? 'text-[#E6FAFF] opacity-70 line-through' : 'text-[#F1F5F9]'}`}
          testID={`goal-detail-task-title-${task.id}`}
        >
          {task.title}
        </Text>
        {task.description ? (
          <Text className="text-[#E6FAFF] text-sm mt-1 opacity-80" numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#33CFFF" />
    </Pressable>
  );
}

function EmptyTaskState({ message, testID }: { message: string; testID: string }) {
  return (
    <View
      className="bg-[#2B42B6] rounded-2xl p-6 items-center border border-[#33CFFF]"
      style={cardShadow}
    >
      <Text className="text-[#708090] text-base text-center italic" testID={testID}>
        {message}
      </Text>
    </View>
  );
}

function formatTargetDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const cardShadow = {
  shadowColor: '#274B8E',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
} as const;
