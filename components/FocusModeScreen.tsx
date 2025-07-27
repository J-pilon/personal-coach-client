import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StatusBar, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LinearGradient from '@/components/ui/LinearGradient';
import { Colors } from '@/constants/Colors';
import { Task } from '@/api/tasks';
import { useUpdateTask } from '@/hooks/useTasks';

interface FocusModeScreenProps {
  selectedTasks: Task[];
  onComplete: (taskId: number) => void;
  onExit: () => void;
}



export function FocusModeScreen({ selectedTasks, onComplete, onExit }: FocusModeScreenProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);


  const updateTaskMutation = useUpdateTask();

  const currentTask = selectedTasks[currentTaskIndex];
  const progress = completedTasks.length;
  const totalTasks = selectedTasks.length;
  const progressPercentage = totalTasks > 0 ? (progress / totalTasks) * 100 : 0;

  useEffect(() => {
    // Set status bar to immersive mode
    StatusBar.setHidden(true);

    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const handleComplete = async () => {
    if (!currentTask?.id) return;

    try {
      await updateTaskMutation.mutateAsync({
        id: currentTask.id,
        taskData: { completed: true }
      });

      setCompletedTasks(prev => [...prev, currentTask.id!]);
      onComplete(currentTask.id);
      moveToNextTask();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleSnooze = () => {
    if (!currentTask?.id) return;

    // Move to next task (snoozed tasks are not counted as completed)
    moveToNextTask();
  };

  const handleSkip = () => {
    // Move to next task (skipped tasks are not counted as completed)
    moveToNextTask();
  };

  const moveToNextTask = () => {
    const nextIndex = currentTaskIndex + 1;
    if (nextIndex < selectedTasks.length) {
      setCurrentTaskIndex(nextIndex);
    } else {
      // All tasks completed or skipped - set currentTaskIndex to -1 to show completion screen
      setCurrentTaskIndex(-1);
    }
  };

  const handleExit = () => {
    onExit();
  };

  if (!currentTask) {
    return (
      <LinearGradient>
        <View className="absolute inset-0 z-50">
          <View className="flex-1 justify-center items-center px-10">
            <Text className="mb-4 text-3xl text-slate-100" testID="focus-mode-completion-title">
              Great job! 🎉
            </Text>
            <Text className="mb-10 text-lg text-center text-slate-200" testID="focus-mode-completion-message">
              You&apos;ve completed {progress} out of {totalTasks} tasks
            </Text>
            <TouchableOpacity
              className="px-6 py-3 rounded-xl border bg-white/10 border-white/20"
              onPress={handleExit}
              testID="focus-mode-completion-exit-button"
            >
              <Text className="text-base font-semibold text-slate-100">Exit Focus Mode</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient>
      <View className="absolute inset-0 z-50">
        {/* Progress Bar */}
        <View className="absolute right-5 left-5 z-10 top-15">
          <View className="mb-2 h-1 rounded bg-white/10">
            <View
              className="h-full bg-cyan-400 rounded"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="text-sm text-center text-slate-200" testID="focus-mode-progress-text">
            {progress} of {totalTasks} completed
          </Text>
        </View>

        {/* Exit Button */}
        <TouchableOpacity
          className="absolute right-5 top-12 z-10 justify-center items-center w-10 h-10 rounded-full bg-white/10"
          onPress={handleExit}
          testID="focus-mode-exit-button"
        >
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        {/* Task Content */}
        <View className="flex-1 justify-center items-center px-10">
          <View className="items-center mb-20">
            <Text className="mb-5 text-2xl leading-9 text-center text-slate-100" testID="focus-mode-task-title">
              {currentTask.title}
            </Text>

            {currentTask.description && (
              <Text className="mb-5 text-lg leading-7 text-center text-slate-200" testID="focus-mode-task-description">
                {currentTask.description}
              </Text>
            )}

            {/* Priority Indicator */}
            {currentTask.priority && (
              <View className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-2xl">
                <Ionicons
                  name="flag"
                  size={16}
                  color={currentTask.priority >= 3 ? Colors.accent.primary : Colors.text.muted}
                />
                <Text className="text-sm text-slate-200 ml-1.5" testID="focus-mode-task-priority">
                  Priority {currentTask.priority}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-around px-5 w-full">
            <TouchableOpacity
              className="justify-center items-center px-5 py-4 rounded-xl border border-cyan-400 bg-cyan-400/10 min-w-20"
              onPress={handleComplete}
              testID="focus-mode-complete-button"
            >
              <Ionicons name="checkmark-circle" size={24} color={Colors.accent.primary} />
              <Text className="mt-2 text-sm font-semibold text-cyan-400">Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="justify-center items-center px-5 py-4 rounded-xl border border-slate-400 bg-white/5 min-w-20"
              onPress={handleSnooze}
              testID="focus-mode-snooze-button"
            >
              <Ionicons name="time" size={24} color={Colors.text.muted} />
              <Text className="mt-2 text-sm font-semibold text-slate-400">Snooze</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="justify-center items-center px-5 py-4 rounded-xl border border-slate-400 bg-white/5 min-w-20"
              onPress={handleSkip}
              testID="focus-mode-skip-button"
            >
              <Ionicons name="arrow-forward" size={24} color={Colors.text.muted} />
              <Text className="mt-2 text-sm font-semibold text-slate-400">Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
} 