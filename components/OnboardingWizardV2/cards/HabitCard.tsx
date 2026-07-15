import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { CreateHabitParams } from '@/models/habit';

interface HabitCardProps {
  habit: CreateHabitParams;
  onChange: (habit: CreateHabitParams) => void;
  onSwap?: () => void;
  isSwapping?: boolean;
  testID?: string;
}

const inputClassName =
  'border border-cyan-400 rounded-lg p-2 text-sm text-[#E6FAFF] bg-slate-800';

export default function HabitCard({
  habit,
  onChange,
  onSwap,
  isSwapping,
  testID,
}: HabitCardProps) {
  const [editing, setEditing] = useState(false);

  const set = <K extends keyof CreateHabitParams>(
    key: K,
    value: CreateHabitParams[K],
  ) => onChange({ ...habit, [key]: value });

  return (
    <View
      testID={testID ?? `habit-card-${habit.position}`}
      className="p-4 mb-3 rounded-xl border border-cyan-400 bg-slate-800"
    >
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <Text className="mr-2 px-2 py-0.5 rounded-full bg-cyan-500 text-xs font-bold text-[#021A40]">
            #{habit.position}
          </Text>
          {editing ? (
            <TextInput
              testID={`habit-title-input-${habit.position}`}
              value={habit.title}
              onChangeText={(v) => set('title', v)}
              className="flex-1 text-base font-bold text-[#E6FAFF]"
              placeholderTextColor="#708090"
            />
          ) : (
            <Text className="flex-1 text-base font-bold text-[#E6FAFF]">
              {habit.title}
            </Text>
          )}
        </View>
        <TouchableOpacity
          testID={`habit-edit-toggle-${habit.position}`}
          onPress={() => setEditing((e) => !e)}
          className="ml-2"
        >
          <Ionicons
            name={editing ? 'checkmark' : 'create-outline'}
            size={18}
            color="#33CFFF"
          />
        </TouchableOpacity>
      </View>

      {editing ? (
        <View className="gap-2">
          <LabeledField
            label="Cue"
            value={habit.cue ?? ''}
            onChange={(v) => set('cue', v)}
          />
          <LabeledField
            label="Minimum version"
            value={habit.minimum_version}
            onChange={(v) => set('minimum_version', v)}
            testID={`habit-minimum-input-${habit.position}`}
          />
          <LabeledField
            label="Normal version"
            value={habit.normal_version}
            onChange={(v) => set('normal_version', v)}
            testID={`habit-normal-input-${habit.position}`}
          />
        </View>
      ) : (
        <View className="gap-1">
          {habit.cue ? (
            <Text className="text-xs text-slate-300">
              <Text className="font-semibold">Cue: </Text>
              {habit.cue}
            </Text>
          ) : null}
          <Text className="text-xs text-slate-300">
            <Text className="font-semibold">Minimum: </Text>
            {habit.minimum_version}
          </Text>
          <Text className="text-xs text-slate-300">
            <Text className="font-semibold">Normal: </Text>
            {habit.normal_version}
          </Text>
          <Text className="text-xs text-slate-300">
            <Text className="font-semibold">Frequency: </Text>
            {habit.frequency}
          </Text>
        </View>
      )}

      {onSwap && (
        <TouchableOpacity
          testID={`habit-swap-${habit.position}`}
          onPress={onSwap}
          disabled={isSwapping}
          className="flex-row items-center self-start mt-3 px-3 py-1 rounded-full border border-cyan-400"
        >
          <Ionicons name="swap-horizontal" size={14} color="#33CFFF" />
          <Text className="ml-1 text-xs font-semibold text-cyan-400">
            {isSwapping ? 'Swapping...' : 'Swap this'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface LabeledFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testID?: string;
}

function LabeledField({ label, value, onChange, testID }: LabeledFieldProps) {
  return (
    <View>
      <Text className="mb-1 text-xs font-medium text-slate-300">{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChange}
        className={inputClassName}
        placeholderTextColor="#708090"
      />
    </View>
  );
}
