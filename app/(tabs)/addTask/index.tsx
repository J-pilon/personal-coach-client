import React, { useState } from 'react';
import { Pressable, Text, TextInput, View, Alert, ActivityIndicator } from 'react-native';
import { useCreateTask } from '@/hooks/useTasks';
import { CreateTaskParams } from '@/api/tasks';
import { router } from 'expo-router';
import LinearGradient from '@/components/ui/LinearGradient';

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
        onError: (error) => {
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create task');
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
      <View className="justify-center items-center mt-8">
        <View className="w-11/12 max-w-md p-7 rounded-2xl shadow-xl bg-[#2B42B6] relative overflow-hidden">
          <View className="absolute inset-0 rounded-2xl" style={{ backgroundColor: 'transparent', zIndex: 0 }} />
          <Text className="mt-8 mb-5 text-[28px] font-semibold text-center text-[#F1F5F9] tracking-wide z-10">What do you need to get done?</Text>

          <TextInput
            className="px-4 py-3 mb-5 rounded-xl text-base text-[#F1F5F9] bg-[#13203a] focus:ring-2"
            placeholder="Name"
            placeholderTextColor="#708090"
            value={taskDetails.name}
            onChangeText={(e) => setTaskDetails(prev => ({ ...prev, name: e }))}
            autoFocus
            editable={!createTaskMutation.isPending}
            testID="add-task-task-name-input"
          />

          <TextInput
            className="px-4 py-3 mb-5 rounded-xl text-base text-[#F1F5F9] bg-[#13203a] focus:ring-2"
            placeholder="Description (optional)"
            placeholderTextColor="#708090"
            value={taskDetails.description}
            onChangeText={(e) => setTaskDetails(prev => ({ ...prev, description: e }))}
            multiline
            editable={!createTaskMutation.isPending}
            testID="add-task-task-description-input"
          />

          <View className="mb-5">
            <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Priority:</Text>
            <View className="flex-row gap-2">
              {([1, 2, 3, 4, 5] as const).map((priority) => (
                <Pressable
                  key={`priority-${priority}`}
                  onPress={() => handlePriorityChange(priority)}
                  className={`flex-1 py-2 px-3 rounded-lg border ${taskDetails.priority === priority
                    ? 'border-[#33CFFF] bg-[#33CFFF]'
                    : 'border-[#708090] bg-[#13203a]'
                    }`}
                  disabled={createTaskMutation.isPending}
                >
                  <Text
                    className={`text-center font-medium capitalize ${taskDetails.priority === priority
                      ? 'text-[#021A40]'
                      : 'text-[#E6FAFF]'
                      }`}
                  >
                    {priority}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Action Category:</Text>
            <View className="flex-row gap-2">
              {(['do', 'defer', 'delegate'] as const).map((category) => (
                <Pressable
                  key={category}
                  onPress={() => handleCategoryChange(category)}
                  className={`flex-1 py-2 px-3 rounded-lg border ${taskDetails.action_category === category
                    ? 'border-[#33CFFF] bg-[#33CFFF]'
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

          <View className="flex flex-row gap-2 justify-end">
            <Pressable
              testID="cancel-button"
              onPress={() => router.back()}
              className="px-6 py-3 rounded-xl border border-[#708090]"
              accessibilityState={{ disabled: createTaskMutation.isPending }}
              disabled={createTaskMutation.isPending}
            >
              <Text className="font-semibold text-[#E6FAFF] text-lg">Cancel</Text>
            </Pressable>

            <Pressable
              testID="add-button"
              onPress={handleAdd}
              className="px-6 py-3 rounded-xl bg-[#33CFFF] shadow-md flex-row items-center"
              style={{ opacity: (!taskDetails.name.trim() || createTaskMutation.isPending) ? 0.5 : 1 }}
              accessibilityState={{ disabled: !taskDetails.name.trim() || createTaskMutation.isPending }}
              disabled={!taskDetails.name.trim() || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? (
                <ActivityIndicator size="small" color="#021A40" className="mr-2" />
              ) : null}
              <Text className="font-semibold text-[#021A40] text-lg" testID="add-task-add-button-text">
                {createTaskMutation.isPending ? 'Adding...' : 'Add'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}