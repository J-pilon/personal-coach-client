import AddTaskButton from '@/components/AddTaskButton';
import { LoadingSpinner } from '@/components/loading';
import TaskItemsAccordion from '@/components/TaskItemsAccordion';
import LinearGradient from '@/components/ui/LinearGradient';
import ScrollView from '@/components/util/ScrollView';
import { useTasks, useToggleTaskCompletion } from '@/hooks/useTasks';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

export default function HomeScreen() {
  const { data: tasks = [], isLoading, error, refetch } = useTasks();
  const toggleTaskMutation = useToggleTaskCompletion();

  const categoryOrder = ['do', 'defer', 'delegate'] as const;

  const groupedTasks = categoryOrder.map(category => ({
    category,
    items: tasks ? tasks.filter(task => task.action_category === category && !task.completed) : [],
  }));

  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    do: true,
    defer: false,
    delegate: false,
    drop: false,
  });

  const handleToggle = async (taskId: number, completed: boolean) => {
    toggleTaskMutation.mutate(
      { id: taskId, completed },
      {
        onError: (error) => {
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update task');
        },
      }
    );

  };

  const toggleAccordion = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  if (isLoading) {
    return (
      <LinearGradient>
        <LoadingSpinner
          size="large"
          text="Loading tasks..."
          variant="fullscreen"
          testID="home-loading"
        />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient>
        <Text className="text-[#F1F5F9] text-lg text-center mb-4" testID="home-error-title">
          Failed to load tasks
        </Text>
        <Text className="text-[#E6FAFF] text-center mb-6" testID="home-error-message">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="bg-[#154FA6] px-6 py-3 rounded-lg"
        >
          <Text className="text-[#021A40] font-semibold">Retry</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient>
      <View className='flex-1'>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text className="text-[28px] font-semibold mb-8 text-center text-[#F1F5F9] tracking-wide">Task List</Text>

          {tasks.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-[#E6FAFF] text-lg text-center mb-2" testID="home-empty-title">No tasks found</Text>
              <Text className="text-[#708090] text-center" testID="home-empty-message">Create your first task to get started</Text>
            </View>
          ) : (
            groupedTasks.map(({ category, items }) => (
              <TaskItemsAccordion
                key={category}
                category={category}
                items={items}
                isOpen={openCategories[category]}
                onToggleAccordion={() => toggleAccordion(category)}
                onToggleTask={handleToggle}
              />
            ))
          )}
        </ScrollView>
        <AddTaskButton />
      </View>
    </LinearGradient>
  );
}
