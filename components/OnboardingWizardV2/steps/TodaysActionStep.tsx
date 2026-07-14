import { useToast } from '@/components/ToastManager';
import { useCreateHabitCompletion } from '@/hooks/useHabitCompletions';
import type { HabitModel } from '@/models/habit';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TodaysActionStepProps {
  habits: HabitModel[];
  onCommitted: (completionHabitId: number) => void;
}

export default function TodaysActionStep({
  habits,
  onCommitted,
}: TodaysActionStepProps) {
  const toast = useToast();
  const createCompletion = useCreateHabitCompletion();
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleCommit = async (habit: HabitModel, _version: 'minimum' | 'normal') => {
    setBusyId(habit.id);
    try {
      const res = await createCompletion.mutateAsync({
        habit_id: habit.id,
        state: 'committed',
      });
      if (res) onCommitted(habit.id);
    } catch {
      toast.error('Could not save your commitment. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View>
      <Text className="mb-3 text-sm text-[#E6FAFF] opacity-80">
        Pick one habit and choose how you&apos;ll show up today.
      </Text>

      {habits.map((habit) => {
        const busy = busyId === habit.id;
        return (
          <View
            key={habit.id}
            testID={`todays-action-card-${habit.position}`}
            className="p-4 mb-3 rounded-xl border border-cyan-400 bg-slate-800"
          >
            <View className="flex-row items-center mb-2">
              <Ionicons name="star" size={18} color="#33CFFF" />
              <Text className="ml-2 text-base font-bold text-[#E6FAFF]">
                {habit.title}
              </Text>
            </View>
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                testID={`todays-action-minimum-${habit.position}`}
                onPress={() => handleCommit(habit, 'minimum')}
                disabled={busy}
                className="flex-1 items-center py-3 rounded-lg border border-cyan-400"
              >
                <Text className="text-sm font-semibold text-cyan-400">
                  Minimum
                </Text>
                <Text className="text-xs text-slate-300 mt-1">
                  {habit.minimum_version}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID={`todays-action-normal-${habit.position}`}
                onPress={() => handleCommit(habit, 'normal')}
                disabled={busy}
                className="flex-1 items-center py-3 rounded-lg bg-cyan-400"
              >
                <Text className="text-sm font-semibold text-[#021A40]">
                  Normal
                </Text>
                <Text className="text-xs text-[#021A40] mt-1">
                  {habit.normal_version}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}
