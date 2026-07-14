import { PrimaryButton } from '@/components/buttons';
import { useToast } from '@/components/ToastManager';
import { useJobStatus } from '@/hooks/useJobStatus';
import { useCreateHabits } from '@/hooks/useHabits';
import { useSuggestHabits } from '@/hooks/useOnboardingResume';
import type { CreateHabitParams, HabitModel, HabitPosition } from '@/models/habit';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import HabitCard from '../cards/HabitCard';

const MVP_TOOLTIP = 'MVP focuses on three. You can add more after your first week.';

const parseSuggestedHabits = (raw: unknown): CreateHabitParams[] | null => {
  const list = Array.isArray(raw)
    ? raw
    : (raw as any)?.habits ?? (raw as any)?.response?.habits;
  if (!Array.isArray(list)) return null;
  return list.slice(0, 3).map((h: any, idx: number) => ({
    title: String(h.title ?? ''),
    frequency: (h.frequency ?? 'daily') as CreateHabitParams['frequency'],
    frequency_config: h.frequency_config ?? null,
    cue: h.cue ?? null,
    minimum_version: String(h.minimum_version ?? ''),
    normal_version: String(h.normal_version ?? ''),
    position: (h.position ?? idx + 1) as HabitPosition,
  }));
};

interface HabitsReviewStepProps {
  smartGoalId: number;
  onHabitsCreated: (habits: HabitModel[]) => void;
}

export default function HabitsReviewStep({
  smartGoalId,
  onHabitsCreated,
}: HabitsReviewStepProps) {
  const toast = useToast();
  const suggest = useSuggestHabits();
  const createHabits = useCreateHabits();

  const [habits, setHabits] = useState<CreateHabitParams[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [swapPosition, setSwapPosition] = useState<HabitPosition | null>(null);
  const [regenerateUsed, setRegenerateUsed] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const startedRef = useRef(false);
  const job = useJobStatus(jobId);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const res = await suggest.mutateAsync({ smart_goal_id: smartGoalId });
        if (res) setJobId(res.job_id);
      } catch {
        toast.error('Failed to suggest habits.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartGoalId]);

  useEffect(() => {
    const status = job.data?.status;
    if (status === 'complete' && job.data?.result) {
      const parsed = parseSuggestedHabits(job.data.result);
      if (parsed) {
        if (swapPosition) {
          setHabits((prev) =>
            prev.map((h) =>
              h.position === swapPosition
                ? { ...parsed[0], position: swapPosition }
                : h,
            ),
          );
          setSwapPosition(null);
        } else {
          setHabits(parsed);
        }
      } else {
        toast.error('AI response did not include habits.');
      }
      setJobId(null);
    } else if (status === 'failed') {
      toast.error('Failed to fetch habits from AI.');
      setJobId(null);
      setSwapPosition(null);
    }
  }, [job.data]);

  const handleSwap = async (position: HabitPosition) => {
    if (jobId) return;
    setSwapPosition(position);
    const exclude = habits
      .filter((h) => h.position === position)
      .map((h) => h.title);
    try {
      const res = await suggest.mutateAsync({
        smart_goal_id: smartGoalId,
        position,
        exclude,
      });
      if (res) setJobId(res.job_id);
    } catch {
      setSwapPosition(null);
    }
  };

  const handleRegenerateAll = async () => {
    if (regenerateUsed || jobId) return;
    setRegenerateUsed(true);
    try {
      const res = await suggest.mutateAsync({
        smart_goal_id: smartGoalId,
        exclude: habits.map((h) => h.title),
      });
      if (res) setJobId(res.job_id);
    } catch {
      // toast handled
    }
  };

  const handleAddAttempt = () => {
    setTooltipVisible(true);
    setTimeout(() => setTooltipVisible(false), 3000);
  };

  const updateHabit = (updated: CreateHabitParams) => {
    setHabits((prev) =>
      prev.map((h) => (h.position === updated.position ? updated : h)),
    );
  };

  const handleContinue = async () => {
    if (habits.length !== 3) {
      toast.error('Please wait for three habits to be ready.');
      return;
    }
    try {
      const created = await createHabits.mutateAsync({
        smart_goal_id: smartGoalId,
        habits,
      });
      if (created) onHabitsCreated(created);
    } catch {
      // toast handled by apiRequest
    }
  };

  const isLoading = !!jobId || suggest.isPending;

  return (
    <View>
      {habits.length === 0 && isLoading && (
        <View className="p-4 mb-4 rounded-xl border border-cyan-400 bg-slate-800">
          <Text className="text-sm text-[#E6FAFF]">
            Suggesting three starter habits…
          </Text>
        </View>
      )}

      {habits.map((h) => (
        <HabitCard
          key={h.position}
          habit={h}
          onChange={updateHabit}
          onSwap={() => handleSwap(h.position)}
          isSwapping={swapPosition === h.position}
        />
      ))}

      {habits.length === 3 && (
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity
            testID="habits-regenerate-all"
            onPress={handleRegenerateAll}
            disabled={regenerateUsed || isLoading}
            className={`flex-row items-center px-3 py-2 rounded-full border ${
              regenerateUsed ? 'border-slate-600' : 'border-cyan-400'
            }`}
          >
            <Ionicons
              name="refresh"
              size={16}
              color={regenerateUsed ? '#708090' : '#33CFFF'}
            />
            <Text
              className={`ml-1 text-xs font-semibold ${
                regenerateUsed ? 'text-slate-500' : 'text-cyan-400'
              }`}
            >
              Regenerate all
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="habits-add-attempt"
            onPress={handleAddAttempt}
            className="flex-row items-center px-3 py-2 rounded-full border border-slate-500"
          >
            <Ionicons name="add" size={16} color="#708090" />
            <Text className="ml-1 text-xs font-semibold text-slate-400">
              Add habit
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {tooltipVisible && (
        <View
          testID="habits-mvp-tooltip"
          className="p-3 mb-4 rounded-lg border border-amber-400 bg-slate-800"
        >
          <Text className="text-xs text-amber-300">{MVP_TOOLTIP}</Text>
        </View>
      )}

      <PrimaryButton
        testID="habits-continue"
        title="These look good"
        icon="arrow-forward"
        onPress={handleContinue}
        isLoading={createHabits.isPending}
        disabled={habits.length !== 3 || isLoading || createHabits.isPending}
        className="mt-3"
      />

    </View>
  );
}
