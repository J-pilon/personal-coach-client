import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Text } from 'react-native';
import LinearGradient from '@/components/ui/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { Task } from '@/api/tasks';
import { useIncompleteTasks, useCreateTask } from '@/hooks/useTasks';
import { useAiSuggestedTasks, AiTaskSuggestion } from '@/hooks/useAiSuggestedTasks';
import { useProfile } from '@/hooks/useUser';
import { AiTaskCard } from '@/components/AiTaskCard';
import { FocusModeScreen } from '@/components/FocusModeScreen';

export default function TodaysFocusScreen() {
  const { data: profile } = useProfile();
  const { data: incompleteTasks = [] } = useIncompleteTasks();
  const createTaskMutation = useCreateTask();

  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const {
    suggestions: aiSuggestions,
    isLoading: aiLoading,
    error: aiError,
    generateSuggestions,
    dismissSuggestion,
  } = useAiSuggestedTasks(profile?.id || 1);

  // Sort tasks by priority (highest first)
  const sortedTasks = [...incompleteTasks].sort((a, b) => {
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    return priorityB - priorityA;
  });



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

  const handleAddToToday = (suggestion: AiTaskSuggestion) => {
    const newTask: Task = {
      title: suggestion.title,
      description: suggestion.description,
      completed: false,
      action_category: 'do',
      priority: 2,
      profile_id: profile?.id || 1,
    };

    setSelectedTasks(prev => [...prev, newTask]);
    dismissSuggestion(suggestion);
  };

  const handleAddForLater = async (suggestion: AiTaskSuggestion) => {
    try {
      await createTaskMutation.mutateAsync({
        title: suggestion.title,
        description: suggestion.description,
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
    <SafeAreaView className="flex-1">
      <LinearGradient>
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4">
          <Text className="text-3xl font-bold text-slate-100">
            Today&apos;s Focus
          </Text>
          <TouchableOpacity
            className="flex-row items-center px-4 py-2 rounded-full border border-cyan-400 bg-cyan-400/10"
            onPress={handleAssistMe}
            disabled={aiLoading}
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
          <View className="p-3 mx-5 mb-4 rounded-lg border bg-red-500/10 border-red-500/30">
            <Text className="text-sm text-red-400">
              {aiError}
            </Text>
          </View>
        )}

        {/* Task List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <View className="mb-6">
              <Text className="mx-5 mb-3 text-xl font-bold text-slate-100">
                AI Suggestions
              </Text>
              {aiSuggestions.map((suggestion, index) => (
                <AiTaskCard
                  key={`ai-${index}`}
                  suggestion={suggestion}
                  onAddToToday={handleAddToToday}
                  onAddForLater={handleAddForLater}
                  onDismiss={handleDismissAiTask}
                />
              ))}
            </View>
          )}

          {/* Your Tasks */}
          <View className="mb-6">
            <Text className="mx-5 mb-3 text-xl font-bold text-slate-100">
              Your Tasks ({selectedTasks.length} selected)
            </Text>

            {sortedTasks.length === 0 && aiSuggestions.length === 0 ? (
              <View className="items-center px-5 py-10">
                <Ionicons name="checkmark-circle-outline" size={48} color={Colors.text.muted} />
                <Text className="mt-4 mb-2 text-lg text-slate-100">
                  No tasks to focus on today
                </Text>
                <Text className="text-sm text-center text-slate-400">
                  Tap &quot;Assist Me&quot; to get AI suggestions
                </Text>
              </View>
            ) : (
              sortedTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  className={`flex-row bg-white/5 mx-5 my-1.5 p-4 rounded-xl border ${isTaskSelected(task) ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10'}`}
                  onPress={() => toggleTaskSelection(task)}
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-100 mb-1.5">
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text className="mb-2 text-sm text-slate-200">
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
                          <Text className="ml-1 text-xs text-slate-400">
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
        </ScrollView>

        {/* Focus Mode Button */}
        {selectedTasks.length > 0 && (
          <View className="px-5 py-4">
            <TouchableOpacity
              className="overflow-hidden rounded-2xl"
              onPress={handleEnterFocusMode}
            >
              <LinearGradient>
                <View className="flex-row justify-center items-center px-6 py-4">
                  <Ionicons name="play" size={24} color={Colors.text.primary} />
                  <Text className="ml-2 text-base font-semibold text-slate-100">
                    Enter Focus Mode ({selectedTasks.length})
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}