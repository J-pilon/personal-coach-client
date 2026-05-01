import { Task } from '@/api/tasks';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number, completed: boolean) => void;
}

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  const getCheckboxClassName = () => {
    const baseClasses = 'h-7 w-7 rounded-full border-2 mr-4';
    if (task.completed) {
      return `${baseClasses} border-[#154FA6] bg-[#154FA6]`;
    }
    if (task.priority === 1) {
      return `${baseClasses} border-[#EF4444] bg-[#021A40]`;
    }
    if (task.priority === 2) {
      return `${baseClasses} border-[#EAB308] bg-[#021A40]`;
    }
    return `${baseClasses} border-[#708090] bg-[#021A40]`;
  };

  return (
    <View className="flex flex-row items-center mb-5">
      <Pressable
        testID="task-checkbox"
        onPress={() => onToggle(task.id!, !task.completed)}
        className={getCheckboxClassName()}
        style={{ alignItems: 'center', justifyContent: 'center', shadowColor: task.completed ? '#154FA6' : 'transparent', shadowOpacity: task.completed ? 0.12 : 0, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}
      >
        {task.completed && (
          <View className="h-3 w-3 rounded-full bg-[#021A40]" />
        )}
      </Pressable>

      <View className="flex-1">
        <Text className={`font-bold ${task.completed ? 'text-[#708090]' : 'text-[#F1F5F9]'} text-[17px] mb-0.5 ${task.completed ? 'line-through' : ''} tracking-tight`} testID={`home-task-title-${task.id}`}>{task.title}</Text>
        {task.description ? (
          <Text className={`${task.completed ? 'text-[#708090]' : 'text-[#E6FAFF]'} text-[15px] tracking-tight`} testID={`home-task-description-${task.id}`}>{task.description}</Text>
        ) : null}
      </View>

      <Pressable
        testID="task-edit-icon"
        onPress={() => router.push(`/taskDetail/${task.id}`)}
        className="p-2 ml-2"
      >
        <FontAwesome name="edit" size={16} color="#708090" />
      </Pressable>
    </View>
  );
}

