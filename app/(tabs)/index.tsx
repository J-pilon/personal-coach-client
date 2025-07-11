import { ThemedText } from '@/components/ThemedText';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, ActivityIndicator, Alert } from 'react-native';
import { useTasks, useToggleTaskCompletion } from '@/hooks/useTasks';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { data: tasks = [], isLoading, error, refetch } = useTasks();
  const toggleTaskMutation = useToggleTaskCompletion();

  const categoryOrder = ['do', 'defer', 'delegate'] as const;

  const groupedTasks = categoryOrder.map(category => ({
    category,
    items: tasks ? tasks.filter(task => task.action_category === category) : [],
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
      <View className="flex-1 bg-[#021A40] justify-center items-center">
        <ActivityIndicator size="large" color="#33CFFF" />
        <Text className="text-[#F1F5F9] mt-4 text-lg">Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#021A40] justify-center items-center px-6">
        <Text className="text-[#F1F5F9] text-lg text-center mb-4">
          Failed to load tasks
        </Text>
        <Text className="text-[#E6FAFF] text-center mb-6">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="bg-[#33CFFF] px-6 py-3 rounded-lg"
        >
          <Text className="text-[#021A40] font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} className="bg-[#021A40] min-h-full">
      <ThemedText className="text-[28px] font-semibold mb-8 text-center text-[#F1F5F9] tracking-wide">Task List</ThemedText>

      {tasks.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-[#E6FAFF] text-lg text-center mb-2">No tasks found</Text>
          <Text className="text-[#708090] text-center">Create your first task to get started</Text>
        </View>
      ) : (
        groupedTasks.map(({ category, items }) => (
          <View key={category} className="mb-9">
            <Pressable
              onPress={() => toggleAccordion(category)}
              className="flex flex-row items-center justify-between px-5 py-4 rounded-2xl border border-[#33CFFF] mb-2 bg-[#13203a] shadow-md"
              style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}
            >
              <View className="flex-row gap-2 items-center">
                <Text className="text-lg font-semibold capitalize text-[#E6FAFF] tracking-wide">{category}</Text>
                <Text className="border border-solid border-[#33CFFF] bg-[#33CFFF] text-[#021A40] px-2 py-0.5 rounded-full min-w-[28px] text-center font-bold text-[15px]">
                  {items.filter((item) => !item.completed).length}
                </Text>
              </View>
              <Text className="text-2xl text-[#E6FAFF]">
                {openCategories[category] ? <FontAwesome name="angle-down" size={26} color="#E6FAFF" /> : <FontAwesome name="angle-up" size={26} color="#E6FAFF" />}
              </Text>
            </Pressable>

            {openCategories[category] && items.length > 0 && (
              <View className="pl-5">
                {items.map((task) => (
                  <View key={task.id} className="flex flex-row items-center mb-5">
                    <Pressable
                      testID="task-checkbox"
                      onPress={() => handleToggle(task.id!, !task.completed)}
                      className={`h-7 w-7 rounded-full border-2 mr-4 ${task.completed ? 'border-[#33CFFF] bg-[#33CFFF]' : 'border-[#708090] bg-[#021A40]'}`}
                      style={{ alignItems: 'center', justifyContent: 'center', shadowColor: task.completed ? '#33CFFF' : 'transparent', shadowOpacity: task.completed ? 0.12 : 0, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}
                    >
                      {task.completed && (
                        <View className="h-3 w-3 rounded-full bg-[#021A40]" />
                      )}
                    </Pressable>

                    <View className="flex-1">
                      <Text className={`font-bold ${task.completed ? 'text-[#708090]' : 'text-[#F1F5F9]'} text-[17px] mb-0.5 ${task.completed ? 'line-through' : ''} tracking-tight`}>{task.title}</Text>
                      {task.description ? (
                        <Text className={`${task.completed ? 'text-[#708090]' : 'text-[#E6FAFF]'} text-[15px] tracking-tight`}>{task.description}</Text>
                      ) : null}
                    </View>

                    {/* Edit Icon */}
                    <Pressable
                      testID="task-edit-icon"
                      onPress={() => router.push(`/taskDetail/${task.id}`)}
                      className="p-2 ml-2"
                    >
                      <FontAwesome name="edit" size={16} color="#708090" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
