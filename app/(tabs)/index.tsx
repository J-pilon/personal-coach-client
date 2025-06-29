import { ThemedText } from '@/components/ThemedText';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([
    { title: 'Buy groceries', description: 'Milk, eggs, bread, and fruit', completed: false, category: "do" },
    { title: 'Read a book', description: 'Finish reading the current novel', completed: false, category: "do" },
    { title: 'Workout', description: '30 minutes of cardio', completed: false, category: "do" },
    { title: 'Call mom', description: 'Check in and say hello', completed: false, category: "delegate" },
    { title: 'Clean the house', description: 'Vacuum and dust living room', completed: false, category: "delegate" },
    { title: 'Write journal', description: 'Reflect on the day', completed: false, category: "defer" },
    { title: 'Plan weekend trip', description: 'Research destinations', completed: false, category: "defer" },
    { title: 'Pay bills', description: 'Electricity and internet', completed: false, category: "do" },
    { title: 'Water plants', completed: false, category: "do" },
    { title: 'Organize desk', description: 'Sort papers and tidy up', completed: false, category: "do" },
  ]);

  const categoryOrder = ['do', 'defer', 'delegate'] as const;

  const groupedTasks = categoryOrder.map(category => ({
    category,
    items: tasks ? tasks.filter(task => task.category === category) : [],
  }));

  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    do: true,
    defer: false,
    delegate: false,
    drop: false,
  });

  const handleToggle = (idx: number) => {
    setTasks(prev => {
      const updated = prev.map((task, i) =>
        i === idx ? { ...task, completed: true } : task
      );
      return [
        ...updated.filter(t => !t.completed),
        ...updated.filter(t => t.completed),
      ];
    });
  };

  const toggleAccordion = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} className="bg-[#021A40] min-h-full">
      <ThemedText className="text-[28px] font-semibold mb-8 text-center text-[#F1F5F9] tracking-wide">Task List</ThemedText>
      {groupedTasks.map(({ category, items }) => (
        <View key={category} className="mb-9">
          <Pressable
            onPress={() => toggleAccordion(category)}
            className="flex flex-row items-center justify-between px-5 py-4 rounded-2xl border border-[#33CFFF] mb-2 bg-[#13203a] shadow-md"
            style={{ shadowColor: '#274B8E', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}
          >
            <View className="flex-row items-center gap-2">
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
              {items.map((task, idx) => {
                const originalIdx = tasks.findIndex(
                  t => t.title === task.title && t.category === task.category
                );
                return (
                  <View key={originalIdx} className="flex flex-row items-center mb-5">
                    <Pressable
                      onPress={() => handleToggle(originalIdx)}
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
                  </View>
                );
              })}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
