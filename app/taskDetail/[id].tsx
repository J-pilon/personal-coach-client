import { UpdateTaskParams } from '@/api/tasks';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PRIORITY_OPTIONS, PriorityInput } from '@/components/inputs';
import { LoadingSpinner } from '@/components/loading';
import { useToast } from '@/components/ToastManager';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useDeleteTask, useTask, useUpdateTask } from '@/hooks/useTasks';
import { taskSchema } from '@/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

const editTaskFormSchema = taskSchema.pick({
  title: true,
  description: true,
  priority: true,
  action_category: true,
});

type EditTaskFormValues = z.infer<typeof editTaskFormSchema>;

const fieldErrorClassName = 'text-red-400 text-xs mt-1';

export default function TaskDetailScreen() {
  const queryClient = useQueryClient();
  return (
    <ErrorBoundary
      scope="task-detail"
      onReset={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
    >
      <TaskDetailContent />
    </ErrorBoundary>
  );
}

function TaskDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const toast = useToast();

  const { data: task, isLoading, error, refetch } = useTask(taskId);

  const { control, handleSubmit, formState: { errors, isValid }, reset } = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      priority: 1,
      action_category: 'do',
    },
  });

  // editingMode: separate ref-like state via reset + a flag
  const [isEditing, setIsEditing] = React.useState(false);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        action_category: task.action_category,
        priority: task.priority || 1,
      });
    }
  }, [task, reset]);

  const onSubmit = (values: EditTaskFormValues) => {
    const updateData: UpdateTaskParams = {
      title: values.title,
      description: values.description || undefined,
      action_category: values.action_category,
      priority: values.priority,
    };

    updateTaskMutation.mutate(
      { id: taskId, taskData: updateData },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Task updated successfully');
        },
      }
    );
  };

  const handleCancelEdit = () => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        action_category: task.action_category,
        priority: task.priority || 1,
      });
    }
    setIsEditing(false);
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
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <LinearGradient>
        <LoadingSpinner
          size="large"
          text="Loading task..."
          variant="fullscreen"
          testID="task-detail-loading"
        />
      </LinearGradient>
    );
  }

  if (error || !task) {
    return (
      <LinearGradient>
        <Text className="text-[#F1F5F9] text-lg text-center mb-4" testID="task-detail-error-title">
          Failed to load task
        </Text>
        <Text className="text-[#E6FAFF] text-center mb-6" testID="task-detail-error-message">
          {error instanceof Error ? error.message : 'Task not found'}
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => refetch()}
            className="px-6 py-3 bg-cyan-400 rounded-lg"
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
      </LinearGradient>
    );
  }

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
          <View className="p-6">
            <View className="flex-row justify-end items-center mb-6">
              <View className="flex-row gap-3">
                {isEditing ? (
                  <>
                    <Pressable
                      onPress={handleCancelEdit}
                      className="px-4 py-2 rounded-lg border border-[#708090]"
                      disabled={updateTaskMutation.isPending}
                      testID="task-detail-cancel-button"
                    >
                      <Text className="text-[#E6FAFF] font-medium" testID="task-detail-cancel-text">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSubmit(onSubmit)}
                      className="flex-row items-center px-4 py-2 bg-cyan-400 rounded-lg"
                      disabled={!isValid || updateTaskMutation.isPending}
                      testID="task-detail-save-button"
                    >
                      {updateTaskMutation.isPending && (
                        <ActivityIndicator size="small" color="#021A40" className="mr-2" />
                      )}
                      <Text className="text-[#021A40] font-medium" testID="task-detail-save-text">
                        {updateTaskMutation.isPending ? 'Saving...' : 'Save'}
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable
                      onPress={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-lg border border-[#33CFFF]"
                      testID="task-detail-edit-button"
                    >
                      <Text className="text-[#33CFFF] font-medium" testID="task-detail-edit-text">Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleDelete}
                      className="px-4 py-2 rounded-lg border border-red-500"
                      disabled={deleteTaskMutation.isPending}
                      testID="task-detail-delete-button"
                    >
                      <Text className="font-medium text-red-500" testID="task-detail-delete-text">
                        {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>

            <View className="mb-6 p-4 rounded-xl bg-[#2B42B6] border border-[#33CFFF]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
              <View className="flex-row justify-between items-center">
                <Text className="text-[#E6FAFF] text-lg font-medium">Status</Text>
                <View className={`px-3 py-1 rounded-full ${task.completed
                  ? 'bg-green-500'
                  : 'bg-cyan-400'
                  }`}>
                  <Text className={`font-medium ${task.completed
                    ? 'text-white'
                    : 'text-[#021A40]'
                    }`} testID="task-detail-status">
                    {task.completed ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Title</Text>
              {isEditing ? (
                <>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        className="px-4 py-3 border border-[#33CFFF] rounded-xl text-base text-[#F1F5F9] bg-[#13203a]"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Task title"
                        placeholderTextColor="#708090"
                        editable={!updateTaskMutation.isPending}
                        testID="task-detail-title-input"
                      />
                    )}
                  />
                  {errors.title && (
                    <Text className={fieldErrorClassName} testID="task-detail-title-error">
                      {errors.title.message}
                    </Text>
                  )}
                </>
              ) : (
                <View className="px-4 py-3 rounded-xl bg-[#13203a] border border-[#708090]">
                  <Text className="text-[#F1F5F9] text-base" testID="task-detail-title">{task.title}</Text>
                </View>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Description</Text>
              {isEditing ? (
                <>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        className="px-4 py-3 border border-[#33CFFF] rounded-xl text-base text-[#F1F5F9] bg-[#13203a]"
                        value={value ?? ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Task description (optional)"
                        placeholderTextColor="#708090"
                        multiline
                        numberOfLines={4}
                        editable={!updateTaskMutation.isPending}
                        testID="task-detail-description-input"
                      />
                    )}
                  />
                  {errors.description && (
                    <Text className={fieldErrorClassName}>
                      {errors.description.message}
                    </Text>
                  )}
                </>
              ) : (
                <View className="px-4 py-3 rounded-xl bg-[#13203a] border border-[#708090]">
                  <Text className="text-[#F1F5F9] text-base" testID="task-detail-description">
                    {task.description || 'No description provided'}
                  </Text>
                </View>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Priority</Text>
              {isEditing ? (
                <Controller
                  control={control}
                  name="priority"
                  render={({ field: { value, onChange } }) => (
                    <PriorityInput
                      value={value ?? 1}
                      onChange={onChange}
                      disabled={updateTaskMutation.isPending}
                    />
                  )}
                />
              ) : (
                <View className="px-4 py-3 rounded-xl bg-[#13203a] border border-[#708090]">
                  <Text className="text-[#F1F5F9] text-base capitalize">
                    {PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label || task.priority}
                  </Text>
                </View>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Action Category</Text>
              {isEditing ? (
                <Controller
                  control={control}
                  name="action_category"
                  render={({ field: { value, onChange } }) => (
                    <View className="flex-row gap-2">
                      {(['do', 'defer', 'delegate'] as const).map((category) => (
                        <Pressable
                          key={category}
                          onPress={() => onChange(category)}
                          className={`flex-1 py-3 px-4 rounded-lg border ${value === category
                            ? 'border-[#33CFFF] bg-cyan-400'
                            : 'border-[#708090] bg-[#13203a]'
                            }`}
                          disabled={updateTaskMutation.isPending}
                        >
                          <Text
                            className={`text-center font-medium capitalize ${value === category
                              ? 'text-[#021A40]'
                              : 'text-[#E6FAFF]'
                              }`}
                          >
                            {category}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />
              ) : (
                <View className="px-4 py-3 rounded-xl bg-[#13203a] border border-[#708090]">
                  <Text className="text-[#F1F5F9] text-base capitalize">{task.action_category}</Text>
                </View>
              )}
            </View>

            <View className="p-4 rounded-xl bg-[#2B42B6] border border-[#708090]" style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
              <Text className="text-[#E6FAFF] text-sm mb-2">Created: {new Date(task.created_at || '').toLocaleDateString()}</Text>
              <Text className="text-[#E6FAFF] text-sm">Updated: {new Date(task.updated_at || '').toLocaleDateString()}</Text>
            </View>
          </View>
        </ScrollView>
      </ KeyboardAvoidingView>
    </LinearGradient>
  );
} 