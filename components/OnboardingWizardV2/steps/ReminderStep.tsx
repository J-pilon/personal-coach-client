import { PrimaryButton } from '@/components/buttons';
import { useToast } from '@/components/ToastManager';
import { useUpsertNotificationSchedule } from '@/hooks/useNotificationSchedules';
import { useCompleteOnboarding, useUpdateProfile } from '@/hooks/useUser';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Slot = 'morning' | 'midday' | 'evening';

const SLOTS: Array<{ slot: Slot; label: string; time: string }> = [
  { slot: 'morning', label: 'Morning', time: '07:00:00' },
  { slot: 'midday', label: 'Midday', time: '12:00:00' },
  { slot: 'evening', label: 'Evening', time: '19:00:00' },
];

const localTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

interface ReminderStepProps {
  onScheduleSaved: (schedule_id: number, permissionGranted: boolean) => void;
}

export default function ReminderStep({ onScheduleSaved }: ReminderStepProps) {
  const toast = useToast();
  const upsertSchedule = useUpsertNotificationSchedule();
  const updateProfile = useUpdateProfile();
  const completeOnboarding = useCompleteOnboarding();
  const [selected, setSelected] = useState<Slot | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setSubmitting(true);
    const slot = SLOTS.find((s) => s.slot === selected)!;
    let granted = true;
    try {
      const token = await registerForPushNotificationsAsync();
      granted = !!token;
    } catch {
      granted = false;
    }
    setPermissionDenied(!granted);

    try {
      const saved = await upsertSchedule.mutateAsync({
        kind: 'daily_check_in',
        local_time: slot.time,
        timezone: localTimezone(),
        active: true,
      });
      if (!granted) {
        toast.info(
          'Notifications are off. Turn them on in Settings when you’re ready.',
        );
      }
      await updateProfile.mutateAsync({ onboarding_version: 'v2' });
      await completeOnboarding.mutateAsync();
      if (saved) onScheduleSaved(saved.id, granted);
    } catch {
      // toast handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <Text className="mb-4 text-sm text-[#E6FAFF] opacity-80">
        When should we check in with you each day?
      </Text>

      <View className="gap-3">
        {SLOTS.map((s) => {
          const active = selected === s.slot;
          return (
            <TouchableOpacity
              key={s.slot}
              testID={`reminder-slot-${s.slot}`}
              onPress={() => setSelected(s.slot)}
              className={`flex-row justify-between items-center p-4 rounded-xl border ${
                active
                  ? 'bg-cyan-400 border-cyan-400'
                  : 'bg-slate-800 border-cyan-400'
              }`}
            >
              <View>
                <Text
                  className={`text-base font-bold ${
                    active ? 'text-[#021A40]' : 'text-[#E6FAFF]'
                  }`}
                >
                  {s.label}
                </Text>
                <Text
                  className={`text-xs ${
                    active ? 'text-[#021A40]' : 'text-slate-300'
                  }`}
                >
                  {s.time.slice(0, 5)}
                </Text>
              </View>
              {active && (
                <Ionicons name="checkmark-circle" size={24} color="#021A40" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {permissionDenied && (
        <View
          testID="reminder-permission-denied-banner"
          className="p-3 mt-4 rounded-lg border border-amber-400 bg-slate-800"
        >
          <Text className="text-xs text-amber-300">
            Notifications are off. Turn them on in Settings when you&apos;re
            ready.
          </Text>
        </View>
      )}

      <PrimaryButton
        testID="reminder-continue"
        title="Set my reminder"
        icon="arrow-forward"
        onPress={handleContinue}
        isLoading={submitting}
        disabled={!selected || submitting}
        className="mt-5"
      />
    </View>
  );
}
