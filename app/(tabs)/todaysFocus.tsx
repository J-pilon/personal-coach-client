import { Task } from '@/api/tasks';
import { AiTaskCard } from '@/components/AiTaskCard';
import { PrimaryButton } from '@/components/buttons/';
import { FocusModeScreen } from '@/components/FocusModeScreen';
import { LoadingSpinner } from '@/components/loading';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { Colors } from '@/constants/Colors';
import { AiTaskSuggestion, useAiSuggestedTasks } from '@/hooks/useAiSuggestedTasks';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTask, useIncompleteTasks } from '@/hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function TodaysFocusScreen() {
  const { profile } = useAuth();
  const { data: incompleteTasks = [] } = useIncompleteTasks();
  const createTaskMutation = useCreateTask();

  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState<Set<string>>(new Set());

  // Profile should always exist at this point due to auth protection in _layout.tsx
  if (!profile) {
    throw new Error('Profile is required but not available. This should not happen.');
  }

  const {
    suggestions: aiSuggestions,
    isLoading: aiLoading,
    error: aiError,
    generateSuggestions,
    dismissSuggestion,
  } = useAiSuggestedTasks();

  const sortSelectedTasks = (): Task[] => {
    const combinedTasks = [...selectedTasks, ...incompleteTasks];

    // Remove duplicates based on task ID
    const uniqueTasks = combinedTasks.filter((task, index, self) =>
      index === self.findIndex(t => t.id === task.id)
    );

    return uniqueTasks.sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return priorityB - priorityA;
    });
  };

  const handleAssistMe = async () => {
    if (!profile?.id) {
      Alert.alert('Error', 'Profile not found');
      return;
    }

    try {
      await generateSuggestions();
    } catch {
      Alert.alert('Error', 'Failed to generate AI suggestions');
    }
  };

  const handleAddToToday = async (suggestion: AiTaskSuggestion) => {
    // Create a unique key for this suggestion to track loading state
    const suggestionKey = `${suggestion.title}-${suggestion.description}`;

    // Set loading state for this suggestion
    setLoadingSuggestions(prev => new Set(prev).add(suggestionKey));

    try {
      const createdTask = await createTaskMutation.mutateAsync({
        title: suggestion.title,
        description: suggestion.description ?? undefined,
        action_category: 'do',
        priority: 2,
      });

      // Add the created task (with proper id) to selectedTasks
      if (createdTask) {
        setSelectedTasks(prev => [...prev, createdTask]);
      }
      dismissSuggestion(suggestion);
    } catch {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      // Clear loading state for this suggestion
      setLoadingSuggestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestionKey);
        return newSet;
      });
    }
  };

  const handleAddForLater = async (suggestion: AiTaskSuggestion) => {
    try {
      await createTaskMutation.mutateAsync({
        title: suggestion.title,
        description: suggestion.description ?? undefined,
        action_category: 'do',
        priority: 2,
      });
      dismissSuggestion(suggestion);
    } catch {
      Alert.alert('Error', 'Failed to save task for later');
    }
  };

  const handleDismissAiTask = (suggestion: AiTaskSuggestion) => {
    dismissSuggestion(suggestion);
  };

  const isSuggestionLoading = (suggestion: AiTaskSuggestion) => {
    const suggestionKey = `${suggestion.title}-${suggestion.description}`;
    return loadingSuggestions.has(suggestionKey);
  };

  const handleEnterFocusMode = () => {
    if (selectedTasks.length === 0) {
      Alert.alert('No Tasks Selected', 'Please select at least one task to enter focus mode.');
      return;
    }
    setIsFocusMode(true);
  };

  const handleExitFocusMode = () => {
    setIsFocusMode(false);
    setSelectedTasks([]);
  };

  const handleTaskComplete = (taskId: number) => {
    // Task completion is handled by the FocusModeScreen
    // This callback can be used for additional logic if needed
  };

  const toggleTaskSelection = (task: Task) => {
    if (task.isAiSuggestion) return; // AI suggestions are handled separately

    setSelectedTasks(prev => {
      const isSelected = prev.some(t => t.id === task.id);
      if (isSelected) {
        return prev.filter(t => t.id !== task.id);
      } else {
        return [...prev, task];
      }
    });
  };

  const isTaskSelected = (task: Task) => {
    return selectedTasks.some(t => t.id === task.id);
  };

  if (isFocusMode) {
    return (
      <FocusModeScreen
        selectedTasks={selectedTasks}
        onComplete={handleTaskComplete}
        onExit={handleExitFocusMode}
      />
    );
  }

  return (
    <LinearGradient>
      <View className="flex-row justify-between items-center px-5 py-4">
        <Text className="text-3xl font-bold text-slate-100" testID="todays-focus-title">
          Today&apos;s Focus
        </Text>
        <TouchableOpacity
          className="flex-row items-center px-4 py-2 rounded-full border border-cyan-400 bg-cyan-400/10"
          onPress={handleAssistMe}
          disabled={aiLoading}
          testID="todays-focus-assist-me-button"
        >
          <Ionicons
            name="bulb"
            size={20}
            color={aiLoading ? Colors.text.muted : Colors.accent.primary}
          />
          <Text className={`text-sm font-semibold ml-1.5 ${aiLoading ? 'text-slate-400' : 'text-cyan-400'}`}>
            {aiLoading ? 'Thinking...' : 'Assist Me'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Error */}
      {aiError && (
        <View className="p-3 mx-5 mb-4 rounded-lg border bg-red-500/10 border-red-500/30" testID="todays-focus-ai-error">
          <Text className="text-sm text-red-400">
            {typeof aiError === 'string' ? aiError : aiError.message}
          </Text>
        </View>
      )}

      {/* Task List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* AI Suggestions */}
        {aiLoading && (
          <View className="mb-6">
            <Text className="mx-5 mb-3 text-xl font-bold text-slate-100" testID="todays-focus-ai-suggestions-title">
              AI Suggestions
            </Text>
            <View className="p-6 mx-5 rounded-xl border border-white/10 bg-white/5">
              <LoadingSpinner
                size="medium"
                text="Generating AI suggestions..."
                variant="inline"
                testID="todays-focus-ai-loading"
              />
            </View>
          </View>
        )}

        {!aiLoading && aiSuggestions.length > 0 && (
          <View className="mb-6">
            <Text className="mx-5 mb-3 text-xl font-bold text-slate-100" testID="todays-focus-ai-suggestions-title">
              AI Suggestions
            </Text>
            {aiSuggestions.map((suggestion, index) => (
              <AiTaskCard
                key={`ai-${index}`}
                suggestion={suggestion}
                onAddToToday={handleAddToToday}
                onAddForLater={handleAddForLater}
                onDismiss={handleDismissAiTask}
                isLoading={isSuggestionLoading(suggestion)}
              />
            ))}
          </View>
        )}

        <View className="mb-6">
          <Text className="mx-5 mb-3 text-xl font-bold text-slate-100" testID="todays-focus-tasks-title">
            Your Tasks ({selectedTasks.length} selected)
          </Text>

          {incompleteTasks.length === 0 && aiSuggestions.length === 0 ? (
            <View className="items-center px-5 py-10" testID="todays-focus-empty-state">
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.text.muted} />
              <Text className="mt-4 mb-2 text-lg text-slate-100" testID="todays-focus-empty-state-title">
                No tasks to focus on today
              </Text>
              <Text className="text-sm text-center text-slate-400" testID="todays-focus-empty-state-message">
                Tap &quot;Assist Me&quot; to get AI suggestions
              </Text>
            </View>
          ) : (
            sortSelectedTasks().map((task) => (
              <TouchableOpacity
                key={task.id}
                className={`flex-row bg-white/5 mx-5 my-1.5 p-4 rounded-xl border ${isTaskSelected(task) ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10'}`}
                onPress={() => toggleTaskSelection(task)}
                testID={`todays-focus-task-${task.id}`}
              >
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-100 mb-1.5" testID={`todays-focus-task-title-${task.id}`}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text className="mb-2 text-sm text-slate-200" testID={`todays-focus-task-description-${task.id}`}>
                      {task.description}
                    </Text>
                  )}
                  <View className="flex-row items-center">
                    {task.priority && (
                      <View className="flex-row items-center px-2 py-1 rounded-xl bg-white/10">
                        <Ionicons
                          name="flag"
                          size={14}
                          color={task.priority >= 3 ? Colors.accent.primary : Colors.text.muted}
                        />
                        <Text className="ml-1 text-xs text-slate-400" testID={`todays-focus-task-priority-${task.id}`}>
                          Priority {task.priority}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className="justify-center items-center w-10">
                  {isTaskSelected(task) && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.accent.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Focus Mode Button */}
        {selectedTasks.length > 0 && (
          <View className="px-5 py-4">
            <PrimaryButton
              title={`Enter Focus Mode (${selectedTasks.length})`}
              onPress={handleEnterFocusMode}
              icon="play"
              iconColor={Colors.text.primary}
              className="bg-cyan-400"
              testID="todays-focus-enter-focus-mode-button"
            />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}