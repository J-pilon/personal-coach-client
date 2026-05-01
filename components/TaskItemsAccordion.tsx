import { Task } from '@/api/tasks';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import TaskItem from './TaskItem';

interface TaskItemsAccordionProps {
  category: string;
  items: Task[];
  isOpen: boolean;
  onToggleAccordion: () => void;
  onToggleTask: (taskId: number, completed: boolean) => void;
}

export default function TaskItemsAccordion({
  category,
  items,
  isOpen,
  onToggleAccordion,
  onToggleTask,
}: TaskItemsAccordionProps) {

  // TODO:
  // order the items in this order:
  // 1. priority 1 and due today
  // 2. priority 2 and due today
  // 3. priority 3 and due today
  // 4. priority 1 and not due date
  // 5. priotrity 2
  // 6. priority 3


  return (
    <View className="mb-9">
      <Pressable
        onPress={onToggleAccordion}
        className="flex flex-row items-center justify-between px-5 py-4 rounded-2xl mb-2 bg-[#2B42B6] shadow-md"
        style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}
      >
        <View className="flex-row gap-2 items-center">
          <Text className="text-lg font-semibold capitalize text-[#E6FAFF] tracking-wide">{category}</Text>
          <Text className="bg-[#2E84FD] text-[#021A40] px-2 py-0.5 rounded-full min-w-[28px] text-center font-bold text-[15px]">
            {items.filter((item) => !item.completed).length}
          </Text>
        </View>
        <Text className="text-2xl text-[#E6FAFF]">
          {isOpen ? <FontAwesome name="angle-down" size={26} color="#E6FAFF" /> : <FontAwesome name="angle-up" size={26} color="#E6FAFF" />}
        </Text>
      </Pressable>

      {isOpen && items.length > 0 && (
        <View className="pl-5">
          {items.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
          ))}
        </View>
      )}
    </View>
  );
}

