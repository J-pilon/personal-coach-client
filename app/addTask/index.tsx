import { CreateTaskParams } from '@/api/tasks';
import { PrimaryButton, SecondaryButton } from '@/components/buttons/';
import { PriorityInput } from '@/components/inputs';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useCreateTask } from '@/hooks/useTasks';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';

export default function AddTaskScreen() {
  const [taskDetails, setTaskDetails] = useState({
    name: '',
    description: '',
    priority: 1,
    action_category: 'do' as 'do' | 'defer' | 'delegate'
  });

  const createTaskMutation = useCreateTask();

  const handleAdd = () => {
    if (taskDetails.name.trim()) {
      const newTask: CreateTaskParams = {
        title: taskDetails.name.trim(),
        description: taskDetails.description.trim() || undefined,
        priority: taskDetails.priority,
        action_category: taskDetails.action_category,
        completed: false,
      };

      createTaskMutation.mutate(newTask, {
        onSuccess: () => {
          // Navigate back to home screen
          router.push('/(tabs)');
        },
      });
    }
  };

  const handleCategoryChange = (category: 'do' | 'defer' | 'delegate') => {
    setTaskDetails(prev => ({ ...prev, action_category: category }));
  };

  const handlePriorityChange = (priority: number) => {
    setTaskDetails(prev => ({ ...prev, priority: priority }));
  };

  return (
    <LinearGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
            paddingBottom: 40
          }}
        >
          <View className="gap-4">
            <Text className="mt-8 mb-5 font-semibold text-center text-3xl text-[#F1F5F9]">What do you need to get done?</Text>

            <TextInput
              className="bg-[#2B42B6] rounded-2xl p-4 text-[#F1F5F9] text-base border border-[#274B8E]"
              placeholder="Name"
              placeholderTextColor="#708090"
              value={taskDetails.name}
              onChangeText={(e) => setTaskDetails(prev => ({ ...prev, name: e }))}
              autoFocus
              editable={!createTaskMutation.isPending}
              testID="add-task-task-name-input"
            />

            <TextInput
              className="bg-[#2B42B6] rounded-2xl p-4 text-[#F1F5F9] text-base border border-[#274B8E]"
              placeholder="Description (optional)"
              placeholderTextColor="#708090"
              value={taskDetails.description}
              onChangeText={(e) => setTaskDetails(prev => ({ ...prev, description: e }))}
              multiline
              editable={!createTaskMutation.isPending}
              testID="add-task-task-description-input"
            />

            <PriorityInput
              value={taskDetails.priority}
              onChange={handlePriorityChange}
              disabled={createTaskMutation.isPending}
              showLabel
            />

            <View className="mb-5">
              <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Action Category:</Text>
              <View className="flex-row gap-2">
                {(['do', 'defer', 'delegate'] as const).map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => handleCategoryChange(category)}
                    className={`flex-1 py-2 px-3 rounded-lg border ${taskDetails.action_category === category
                      ? 'border-cyan-400 bg-cyan-400'
                      : 'border-[#708090] bg-[#13203a]'
                      }`}
                    disabled={createTaskMutation.isPending}
                  >
                    <Text
                      className={`text-center font-medium capitalize ${taskDetails.action_category === category
                        ? 'text-[#021A40]'
                        : 'text-[#E6FAFF]'
                        }`}
                    >
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-4">
              <PrimaryButton
                title='Add'
                onPress={handleAdd}
                disabled={!taskDetails.name.trim() || createTaskMutation.isPending}
                isLoading={createTaskMutation.isPending}
                loadingText='Adding...'
                testID='add-task-add-button'
              />

              <SecondaryButton
                title='Cancel'
                onPress={() => router.back()}
                testID='add-task-cancel-button'
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}