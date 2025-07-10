import React, { useState, useEffect } from 'react';
import { Pressable, Text, TextInput, View, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUpdateTask, useDeleteTask, useTask } from '@/hooks/useTasks';
import { UpdateTaskParams } from '@/api/tasks';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);

  const [isEditing, setIsEditing] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    title: '',
    description: '',
    action_category: 'do' as 'do' | 'defer' | 'delegate'
  });

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Fetch task details
  const { data: task, isLoading, error, refetch } = useTask(taskId);

  // Update local state when task data is loaded
  useEffect(() => {
    if (task) {
      setTaskDetails({
        title: task.title,
        description: task.description || '',
        action_category: task.action_category,
      });
    }
  }, [task]);

  const handleSave = () => {
    if (!taskDetails.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const updateData: UpdateTaskParams = {
      title: taskDetails.title.trim(),
      description: taskDetails.description.trim() || undefined,
      action_category: taskDetails.action_category,
    };

    updateTaskMutation.mutate(
      { id: taskId, taskData: updateData },
      {
        onSuccess: () => {
          setIsEditing(false);
          Alert.alert('Success', 'Task updated successfully');
        },
        onError: (error) => {
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update task');
        },
      }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTaskMutation.mutate(taskId, {
              onSuccess: () => {
                router.back();
              },
              onError: (error) => {
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete task');
              },
            });
          },
        },
      ]
    );
  };

  const handleCategoryChange = (category: 'do' | 'defer' | 'delegate') => {
    setTaskDetails(prev => ({ ...prev, action_category: category }));
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#021A40] justify-center items-center">
        <ActivityIndicator size="large" color="#33CFFF" />
        <Text className="text-[#F1F5F9] mt-4 text-lg">Loading task...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View className="flex-1 bg-[#021A40] justify-center items-center px-6">
        <Text className="text-[#F1F5F9] text-lg text-center mb-4">
          Failed to load task
        </Text>
        <Text className="text-[#E6FAFF] text-center mb-6">
          {error instanceof Error ? error.message : 'Task not found'}
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => refetch()}
            className="bg-[#33CFFF] px-6 py-3 rounded-lg"
          >
            <Text className="text-[#021A40] font-semibold">Retry</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            className="border border-[#708090] px-6 py-3 rounded-lg"
          >
            <Text className="text-[#E6FAFF] font-semibold">Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#021A40]">
      <View className="p-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Pressable
            onPress={() => router.back()}
            className="p-2"
          >
            <FontAwesome name="arrow-left" size={20} color="#E6FAFF" />
          </Pressable>

          <View className="flex-row gap-3">
            {isEditing ? (
              <>
                <Pressable
                  onPress={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-[#708090]"
                  disabled={updateTaskMutation.isPending}
                >
                  <Text className="text-[#E6FAFF] font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  className="px-4 py-2 rounded-lg bg-[#33CFFF] flex-row items-center"
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending && (
                    <ActivityIndicator size="small" color="#021A40" className="mr-2" />
                  )}
                  <Text className="text-[#021A40] font-medium">
                    {updateTaskMutation.isPending ? 'Saving...' : 'Save'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg border border-[#33CFFF]"
                >
                  <Text className="text-[#33CFFF] font-medium">Edit</Text>
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  className="px-4 py-2 rounded-lg border border-red-500"
                  disabled={deleteTaskMutation.isPending}
                >
                  <Text className="font-medium text-red-500">
                    {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Task Status */}
        <View className="mb-6 p-4 rounded-xl bg-[#13203a] border border-[#33CFFF]">
          <View className="flex-row justify-between items-center">
            <Text className="text-[#E6FAFF] text-lg font-medium">Status</Text>
            <View className={`px-3 py-1 rounded-full ${task.completed
              ? 'bg-green-500'
              : 'bg-[#33CFFF]'
              }`}>
              <Text className={`font-medium ${task.completed
                ? 'text-white'
                : 'text-[#021A40]'
                }`}>
                {task.completed ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Task Title */}
        <View className="mb-6">
          <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Title</Text>
          {isEditing ? (
            <TextInput
              className="px-4 py-3 border border-[#33CFFF] rounded-xl text-base text-[#F1F5F9] bg-[#13203a]"
              value={taskDetails.title}
              onChangeText={(text) => setTaskDetails(prev => ({ ...prev, title: text }))}
              placeholder="Task title"
              placeholderTextColor="#708090"
              editable={!updateTaskMutation.isPending}
            />
          ) : (
            <View className="px-4 py-3 rounded-xl bg-[#13203a] border border-[#708090]">
              <Text className="text-[#F1F5F9] text-base">{task.title}</Text>
            </View>
          )}
        </View>

        {/* Task Description */}
        <View className="mb-6">
          <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Description</Text>
          {isEditing ? (
            <TextInput
              className="px-4 py-3 border border-[#33CFFF] rounded-xl text-base text-[#F1F5F9] bg-[#13203a]"
              value={taskDetails.description}
              onChangeText={(text) => setTaskDetails(prev => ({ ...prev, description: text }))}
              placeholder="Task description (optional)"
              placeholderTextColor="#708090"
              multiline
              numberOfLines={4}
              editable={!updateTaskMutation.isPending}
            />
          ) : (
            <View className="px-4 py-3 rounded-xl bg-[#13203a] border border-[#708090]">
              <Text className="text-[#F1F5F9] text-base">
                {task.description || 'No description provided'}
              </Text>
            </View>
          )}
        </View>

        {/* Action Category */}
        <View className="mb-6">
          <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Action Category</Text>
          {isEditing ? (
            <View className="flex-row gap-2">
              {(['do', 'defer', 'delegate'] as const).map((category) => (
                <Pressable
                  key={category}
                  onPress={() => handleCategoryChange(category)}
                  className={`flex-1 py-3 px-4 rounded-lg border ${taskDetails.action_category === category
                    ? 'border-[#33CFFF] bg-[#33CFFF]'
                    : 'border-[#708090] bg-[#13203a]'
                    }`}
                  disabled={updateTaskMutation.isPending}
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
          ) : (
            <View className="px-4 py-3 rounded-xl bg-[#13203a] border border-[#708090]">
              <Text className="text-[#F1F5F9] text-base capitalize">{task.action_category}</Text>
            </View>
          )}
        </View>

        {/* Created/Updated Info */}
        <View className="p-4 rounded-xl bg-[#13203a] border border-[#708090]">
          <Text className="text-[#E6FAFF] text-sm mb-2">Created: {new Date(task.created_at || '').toLocaleDateString()}</Text>
          <Text className="text-[#E6FAFF] text-sm">Updated: {new Date(task.updated_at || '').toLocaleDateString()}</Text>
        </View>
      </View>
    </ScrollView>
  );
} 