import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function AddTaskScreen() {
  const [taskDetails, setTaskDetails] = useState({
    name: '',
    description: ''
  })

  const handleAdd = () => {
    if (taskDetails.name.trim()) {

    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#021A40]">
      <View className="w-11/12 max-w-md p-7 rounded-2xl shadow-xl bg-[#021A40] relative overflow-hidden">
        <View className="absolute inset-0 rounded-2xl" style={{ backgroundColor: 'transparent', zIndex: 0 }} />
        <Text className="mt-8 mb-5 text-[28px] font-semibold text-center text-[#F1F5F9] tracking-wide z-10">What do you need to get done?</Text>
        <TextInput
          className="px-4 py-3 mb-5 border border-[#33CFFF] rounded-xl text-base text-[#F1F5F9] bg-[#13203a] focus:border-[#33CFFF] focus:ring-2 focus:ring-[#33CFFF]"
          placeholder="Name"
          placeholderTextColor="#708090"
          value={taskDetails.name}
          onChangeText={(e) => setTaskDetails(prev => ({ ...prev, name: e }))}
          autoFocus
        />
        <TextInput
          className="px-4 py-3 mb-5 border border-[#708090] rounded-xl text-base text-[#F1F5F9] bg-[#13203a] focus:border-[#33CFFF] focus:ring-2 focus:ring-[#33CFFF]"
          placeholder="Description (optional)"
          placeholderTextColor="#708090"
          value={taskDetails.description}
          onChangeText={(e) => setTaskDetails(prev => ({ ...prev, description: e }))}
          multiline
        />
        <View className="flex flex-row justify-end gap-2">
          <Pressable
            onPress={handleAdd}
            className="px-6 py-3 rounded-xl bg-[#33CFFF] shadow-md"
            style={{ opacity: !taskDetails.name.trim() ? 0.5 : 1 }}
            disabled={!taskDetails.name.trim()}
          >
            <Text className="font-semibold text-[#021A40] text-lg">Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}