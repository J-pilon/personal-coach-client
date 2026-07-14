import { PrimaryButton } from '@/components/buttons';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { SmartGoalDraft } from '@/models/onboardingDiscovery';

interface SmartGoalCardProps {
  draft: SmartGoalDraft['goal'];
  onChange: (draft: SmartGoalDraft['goal']) => void;
  onConfirm: () => void;
  isSaving?: boolean;
  testID?: string;
}

const inputClassName =
  'border border-cyan-400 rounded-lg p-3 text-base text-[#E6FAFF] bg-slate-800';

export default function SmartGoalCard({
  draft,
  onChange,
  onConfirm,
  isSaving,
  testID,
}: SmartGoalCardProps) {
  const [editing, setEditing] = useState(false);

  const set = <K extends keyof SmartGoalDraft['goal']>(
    key: K,
    value: SmartGoalDraft['goal'][K],
  ) => onChange({ ...draft, [key]: value });

  return (
    <View
      testID={testID ?? 'smart-goal-card'}
      className="p-4 mb-4 rounded-xl border border-cyan-400 bg-slate-800"
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Ionicons name="flag" size={20} color="#33CFFF" />
          <Text className="ml-2 text-lg font-bold text-[#E6FAFF]">
            Your goal
          </Text>
        </View>
        <TouchableOpacity
          testID="smart-goal-card-edit-toggle"
          onPress={() => setEditing((e) => !e)}
          className="flex-row items-center px-3 py-1 rounded-full border border-cyan-400"
        >
          <Ionicons
            name={editing ? 'checkmark' : 'create-outline'}
            size={16}
            color="#33CFFF"
          />
          <Text className="ml-1 text-xs font-semibold text-cyan-400">
            {editing ? 'Done' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {editing ? (
        <View className="gap-3">
          <Field
            label="Title"
            value={draft.title}
            onChange={(v) => set('title', v)}
            testID="smart-goal-title-input"
          />
          <Field
            label="Why this matters"
            value={draft.why ?? ''}
            onChange={(v) => set('why', v)}
            multiline
            testID="smart-goal-why-input"
          />
          <Field
            label="Specific"
            value={draft.specific}
            onChange={(v) => set('specific', v)}
            multiline
          />
          <Field
            label="Measurable"
            value={draft.measurable}
            onChange={(v) => set('measurable', v)}
            multiline
          />
          <Field
            label="Time-bound"
            value={draft.time_bound}
            onChange={(v) => set('time_bound', v)}
          />
        </View>
      ) : (
        <View className="gap-2">
          <ReadRow label="Title" value={draft.title} />
          {draft.why ? <ReadRow label="Why" value={draft.why} /> : null}
          <ReadRow label="Specific" value={draft.specific} />
          <ReadRow label="Measurable" value={draft.measurable} />
          <ReadRow label="Time-bound" value={draft.time_bound} />
        </View>
      )}

      <PrimaryButton
        testID="smart-goal-card-confirm"
        title="This is my goal"
        loadingText="Saving..."
        icon="arrow-forward"
        onPress={onConfirm}
        isLoading={isSaving}
        disabled={isSaving}
        className="mt-4"
      />
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  testID?: string;
}

function Field({ label, value, onChange, multiline, testID }: FieldProps) {
  return (
    <View>
      <Text className="mb-1 text-xs font-medium text-slate-300">{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        placeholderTextColor="#708090"
        className={
          multiline
            ? `${inputClassName} min-h-[60px]`
            : inputClassName
        }
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xs font-medium text-slate-300">{label}</Text>
      <Text className="ml-2 text-sm text-[#E6FAFF]">{value}</Text>
    </View>
  );
}
