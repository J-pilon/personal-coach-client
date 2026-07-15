import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { useToast } from '@/components/ToastManager';
import { useProfile, useUpdateProfile } from '@/hooks/useUser';
import type { ProfileUpdateData } from '@/api/users';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

const inputClassName =
  'border border-cyan-400 rounded-lg p-3 text-base text-[#E6FAFF] bg-slate-800';

interface ProfileDeferredStepProps {
  onFinished: () => void;
}

export default function ProfileDeferredStep({
  onFinished,
}: ProfileDeferredStepProps) {
  const toast = useToast();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [values, setValues] = useState<ProfileUpdateData>({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    work_role: profile?.work_role ?? '',
    education: profile?.education ?? '',
    desires: profile?.desires ?? '',
    limiting_beliefs: profile?.limiting_beliefs ?? '',
  });

  const set = <K extends keyof ProfileUpdateData>(
    key: K,
    v: ProfileUpdateData[K],
  ) => setValues((prev) => ({ ...prev, [key]: v }));

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(values);
      toast.success('Profile saved.');
      onFinished();
    } catch {
      // toast handled by apiRequest
    }
  };

  return (
    <View>
      <Text className="mb-4 text-sm text-[#E6FAFF] opacity-80">
        Tell us a bit more so coaching gets sharper. All optional.
      </Text>

      <View className="gap-3">
        <Field
          label="First name"
          value={values.first_name ?? ''}
          onChange={(v) => set('first_name', v)}
          testID="profile-deferred-first-name"
        />
        <Field
          label="Last name"
          value={values.last_name ?? ''}
          onChange={(v) => set('last_name', v)}
          testID="profile-deferred-last-name"
        />
        <Field
          label="Work role"
          value={values.work_role ?? ''}
          onChange={(v) => set('work_role', v)}
          testID="profile-deferred-work-role"
        />
        <Field
          label="Education"
          value={values.education ?? ''}
          onChange={(v) => set('education', v)}
          testID="profile-deferred-education"
        />
        <Field
          label="Desires"
          value={values.desires ?? ''}
          onChange={(v) => set('desires', v)}
          multiline
          testID="profile-deferred-desires"
        />
        <Field
          label="Limiting beliefs"
          value={values.limiting_beliefs ?? ''}
          onChange={(v) => set('limiting_beliefs', v)}
          multiline
          testID="profile-deferred-limiting-beliefs"
        />
      </View>

      <PrimaryButton
        testID="profile-deferred-save"
        title="Save and finish"
        icon="checkmark"
        onPress={handleSave}
        isLoading={updateProfile.isPending}
        className="mt-5"
      />
      <SecondaryButton
        testID="profile-deferred-later"
        title="Maybe later"
        onPress={onFinished}
        className="mt-3"
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
          multiline ? `${inputClassName} min-h-[70px]` : inputClassName
        }
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}
