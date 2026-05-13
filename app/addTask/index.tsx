import { CreateTaskParams } from '@/api/tasks';
import { PrimaryButton, SecondaryButton } from '@/components/buttons/';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PriorityInput } from '@/components/inputs';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useCreateTask } from '@/hooks/useTasks';
import { taskSchema } from '@/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

const addTaskFormSchema = taskSchema.pick({
  title: true,
  description: true,
  priority: true,
  action_category: true,
});

type AddTaskFormValues = z.infer<typeof addTaskFormSchema>;

const fieldErrorClassName = 'text-red-400 text-xs mt-1';

export default function AddTaskScreen() {
  return (
    <ErrorBoundary scope="add-task">
      <AddTaskContent />
    </ErrorBoundary>
  );
}

function AddTaskContent() {
  const createTaskMutation = useCreateTask();

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      priority: 1,
      action_category: 'do',
    },
  });

  const onSubmit = (values: AddTaskFormValues) => {
    const newTask: CreateTaskParams = {
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      action_category: values.action_category,
      completed: false,
    };

    createTaskMutation.mutate(newTask, {
      onSuccess: () => router.push('/(tabs)'),
    });
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

            <View>
              <Controller
                control={control}
                name="title"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className="bg-[#2B42B6] rounded-2xl p-4 text-[#F1F5F9] text-base border border-[#274B8E]"
                    placeholder="Name"
                    placeholderTextColor="#708090"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoFocus
                    editable={!createTaskMutation.isPending}
                    testID="add-task-task-name-input"
                  />
                )}
              />
              {errors.title && (
                <Text className={fieldErrorClassName} testID="add-task-task-name-error">
                  {errors.title.message}
                </Text>
              )}
            </View>

            <View>
              <Controller
                control={control}
                name="description"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className="bg-[#2B42B6] rounded-2xl p-4 text-[#F1F5F9] text-base border border-[#274B8E]"
                    placeholder="Description (optional)"
                    placeholderTextColor="#708090"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    editable={!createTaskMutation.isPending}
                    testID="add-task-task-description-input"
                  />
                )}
              />
              {errors.description && (
                <Text className={fieldErrorClassName}>
                  {errors.description.message}
                </Text>
              )}
            </View>

            <Controller
              control={control}
              name="priority"
              render={({ field: { value, onChange } }) => (
                <PriorityInput
                  value={value ?? 1}
                  onChange={onChange}
                  disabled={createTaskMutation.isPending}
                  showLabel
                />
              )}
            />

            <View className="mb-5">
              <Text className="text-[#E6FAFF] text-base mb-3 font-medium">Action Category:</Text>
              <Controller
                control={control}
                name="action_category"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-row gap-2">
                    {(['do', 'defer', 'delegate'] as const).map((category) => (
                      <Pressable
                        key={category}
                        onPress={() => onChange(category)}
                        className={`flex-1 py-2 px-3 rounded-lg border ${value === category
                          ? 'border-cyan-400 bg-cyan-400'
                          : 'border-[#708090] bg-[#13203a]'
                          }`}
                        disabled={createTaskMutation.isPending}
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
            </View>

            <View className="gap-4">
              <PrimaryButton
                title='Add'
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || createTaskMutation.isPending}
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
