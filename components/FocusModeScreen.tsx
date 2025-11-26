import { Task } from '@/api/tasks';
import LinearGradient from '@/components/ui/LinearGradient';
import { Colors } from '@/constants/Colors';
import { useUpdateTask } from '@/hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FocusModeScreenProps {
  selectedTasks: Task[];
  onComplete: (taskId: number) => void;
  onExit: () => void;
}

export function FocusModeScreen({ selectedTasks, onComplete, onExit }: FocusModeScreenProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [currentTasks, setCurrentTasks] = useState<Task[]>(selectedTasks || [])
  const [allTasksCompleted, setAllTasksCompleted] = useState<boolean>(false)

  const updateTaskMutation = useUpdateTask();

  const currentTask: Task = currentTasks[currentTaskIndex];
  const progress = completedTasks.length;
  const totalTasks = currentTasks.length;
  const progressPercentage = totalTasks > 0 ? (progress / totalTasks) * 100 : 0;

  // Scale animations for buttons
  const completeScale = useSharedValue(1);
  const snoozeScale = useSharedValue(1);
  const skipScale = useSharedValue(1);

  // Animated styles
  const completeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completeScale.value }],
  }));

  const snoozeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: snoozeScale.value }],
  }));

  const skipButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipScale.value }],
  }));

  // Animation helper
  const animateButton = (scale: typeof completeScale) => {
    scale.value = withTiming(0.85, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 400 });
    });
  };

  useEffect(() => {
    StatusBar.setHidden(true);

    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const handleComplete = async () => {
    animateButton(completeScale);
    if (!currentTask.id) return;

    try {
      const result = await updateTaskMutation.mutateAsync({
        id: currentTask.id,
        taskData: { completed: true }
      });

      if (result === undefined) {
        throw new Error('Task update failed: result is undefined.');
      }

      const newCompletedTasks = [...completedTasks, currentTask.id];
      setCompletedTasks(newCompletedTasks);

      const updatedTasks = currentTasks.map(task =>
        task.id === result.id ? result : task
      );
      setCurrentTasks(updatedTasks);

      const tasksToComplete = updatedTasks.filter(task => task.completed === false);
      if (tasksToComplete.length === 0) {
        setAllTasksCompleted(true);
        return;
      }

      moveToNextTask(updatedTasks);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleSnooze = () => {
    animateButton(snoozeScale);
    const updatedTasks = currentTasks.filter(task => task.id !== currentTask.id);
    setCurrentTasks(updatedTasks)

    const nextIndex = updatedTasks.findIndex(task => !task.completed);
    if (nextIndex !== -1) {
      setCurrentTaskIndex(nextIndex);
    } else {
      setAllTasksCompleted(true);
    }
  };

  const handleSkip = () => {
    animateButton(skipScale);
    moveToNextTask(currentTasks);
  };

  const moveToNextTask = (currentTasks: Task[]) => {
    const tasksToComplete = currentTasks.filter(task => task.completed === false)
    if (tasksToComplete.length === 0) return setAllTasksCompleted(true);

    // Find the next incomplete task from current position or wrap to beginning
    let nextIndex = currentTasks.findIndex((task, idx) =>
      !task.completed && idx > currentTaskIndex
    );

    if (nextIndex === -1) {
      // If no task found from current position, check from beginning
      nextIndex = currentTasks.findIndex(task => !task.completed);
    }

    if (nextIndex !== -1) {
      setCurrentTaskIndex(nextIndex);
    } else {
      setAllTasksCompleted(true);
    }
  };

  const handleExit = () => {
    onExit();
  };

  if (!currentTask || allTasksCompleted) {
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

        <TouchableOpacity
          className="absolute right-5 top-12 z-10 justify-center items-center w-10 h-10 rounded-full bg-white/10"
          onPress={handleExit}
          testID="focus-mode-exit-button"
        >
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

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
            <Pressable onPress={handleComplete} testID="focus-mode-complete-button">
              <Animated.View
                className="justify-center items-center px-5 py-4 rounded-xl border border-cyan-400 bg-cyan-400/10 min-w-20"
                style={completeButtonStyle}
              >
                <Ionicons name="checkmark-circle" size={24} color={Colors.accent.primary} />
                <Text className="mt-2 text-sm font-semibold text-cyan-400">Complete</Text>
              </Animated.View>
            </Pressable>

            <Pressable onPress={handleSnooze} testID="focus-mode-snooze-button">
              <Animated.View
                className="justify-center items-center px-5 py-4 rounded-xl border border-slate-400 bg-white/5 min-w-20"
                style={snoozeButtonStyle}
              >
                <Ionicons name="time" size={24} color={Colors.text.muted} />
                <Text className="mt-2 text-sm font-semibold text-slate-400">Snooze</Text>
              </Animated.View>
            </Pressable>

            <Pressable onPress={handleSkip} testID="focus-mode-skip-button">
              <Animated.View
                className="justify-center items-center px-5 py-4 rounded-xl border border-slate-400 bg-white/5 min-w-20"
                style={skipButtonStyle}
              >
                <Ionicons name="arrow-forward" size={24} color={Colors.text.muted} />
                <Text className="mt-2 text-sm font-semibold text-slate-400">Skip</Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
} 