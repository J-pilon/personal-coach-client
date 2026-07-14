import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { useToast } from '@/components/ToastManager';
import { useJobStatus } from '@/hooks/useJobStatus';
import {
  useSendDiscoveryMessage,
  useStartDiscoverySession,
} from '@/hooks/useOnboardingResume';
import { useCreateSmartGoal } from '@/hooks/useSmartGoals';
import { useProfile } from '@/hooks/useUser';
import {
  discoveryTurnSchema,
  type DiscoveryTurn,
  type SmartGoalDraft,
} from '@/models/onboardingDiscovery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import ChatBubble from '../cards/ChatBubble';
import SmartGoalCard from '../cards/SmartGoalCard';

const EMPTY_DRAFT: SmartGoalDraft['goal'] = {
  title: '',
  why: '',
  specific: '',
  measurable: '',
  time_bound: '',
  timeframe: '3_months',
};

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface GoalDiscoveryStepProps {
  onGoalCommitted: (smart_goal_id: number) => void;
}

export default function GoalDiscoveryStep({
  onGoalCommitted,
}: GoalDiscoveryStepProps) {
  const toast = useToast();
  const { data: profile } = useProfile();
  const startSession = useStartDiscoverySession();
  const sendMessage = useSendDiscoveryMessage();
  const createSmartGoal = useCreateSmartGoal();

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<SmartGoalDraft['goal'] | null>(null);
  const [input, setInput] = useState('');
  const [failureCount, setFailureCount] = useState(0);
  const [extraTurns, setExtraTurns] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const startedRef = useRef(false);

  const job = useJobStatus(jobId);

  // Kick off the first discovery session on mount
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const res = await startSession.mutateAsync();
        if (res) {
          setSessionId(res.session_id);
          setJobId(res.job_id);
        }
      } catch {
        setFailureCount((n) => n + 1);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Consume job results
  useEffect(() => {
    const status = job.data?.status;
    const result = job.data?.result as unknown;
    if (status === 'complete' && result) {
      const parsed = discoveryTurnSchema.safeParse(result);
      if (!parsed.success) {
        setFailureCount((n) => n + 1);
        setJobId(null);
        return;
      }
      handleTurn(parsed.data);
      setJobId(null);
    } else if (status === 'failed') {
      setFailureCount((n) => n + 1);
      setJobId(null);
    }
  }, [job.data]);

  const handleTurn = (turn: DiscoveryTurn) => {
    if (turn.kind === 'question') {
      setMessages((m) => [...m, { role: 'ai', text: turn.text }]);
    } else {
      setDraft(turn.goal);
    }
  };

  const handleSend = async () => {
    if (!sessionId || !input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    if (draft) setExtraTurns((n) => n + 1);
    try {
      const res = await sendMessage.mutateAsync({ session_id: sessionId, text });
      if (res) setJobId(res.job_id);
    } catch {
      setFailureCount((n) => n + 1);
    }
  };

  const handleCommitGoal = async () => {
    if (!draft || !profile) return;
    setSavingGoal(true);
    try {
      const created = await createSmartGoal.mutateAsync({
        title: draft.title,
        specific: draft.specific,
        measurable: draft.measurable,
        achievable: draft.specific,
        relevant: draft.why ?? draft.specific,
        time_bound: draft.time_bound,
        timeframe: draft.timeframe,
        target_date: draft.target_date,
      } as any);
      if (created?.id) {
        onGoalCommitted(created.id);
      } else {
        toast.error('Failed to save goal. Please try again.');
      }
    } catch {
      // apiRequest surfaces toast
    } finally {
      setSavingGoal(false);
    }
  };

  const isPolling = !!jobId && !job.data;
  const showFallback = failureCount >= 2 && !manualMode && !draft;
  const canAskMore = draft && extraTurns < 2 && !manualMode;

  const composerDisabled = useMemo(
    () => isPolling || sendMessage.isPending || (!!draft && !canAskMore),
    [isPolling, sendMessage.isPending, draft, canAskMore],
  );

  return (
    <View>
      <View className="mb-4">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} />
        ))}
        {isPolling && (
          <ChatBubble
            role="ai"
            text="Thinking…"
            testID="chat-bubble-thinking"
          />
        )}
      </View>

      {(draft || manualMode) && (
        <SmartGoalCard
          draft={draft ?? EMPTY_DRAFT}
          onChange={setDraft}
          onConfirm={handleCommitGoal}
          isSaving={savingGoal}
        />
      )}

      {showFallback && (
        <View
          testID="goal-discovery-manual-fallback"
          className="p-4 mb-4 rounded-xl border border-amber-400 bg-slate-800"
        >
          <Text className="mb-2 text-sm text-[#E6FAFF]">
            We&apos;re having trouble reaching the AI. You can write your goal
            yourself.
          </Text>
          <SecondaryButton
            title="Skip AI, write the goal yourself"
            testID="goal-discovery-manual-button"
            onPress={() => {
              setManualMode(true);
              setDraft(EMPTY_DRAFT);
            }}
          />
        </View>
      )}

      {!draft && !manualMode && (
        <View>
          <TextInput
            testID="goal-discovery-input"
            className="border border-cyan-400 rounded-lg p-3 text-base text-[#E6FAFF] bg-slate-800 min-h-[80px]"
            placeholder="Type your reply…"
            placeholderTextColor="#708090"
            value={input}
            onChangeText={setInput}
            multiline
            editable={!composerDisabled}
            textAlignVertical="top"
          />
          <PrimaryButton
            testID="goal-discovery-send"
            title="Send"
            icon="arrow-forward"
            onPress={handleSend}
            disabled={composerDisabled || !input.trim()}
            className="mt-3"
          />
        </View>
      )}

      {canAskMore && (
        <View className="mt-3">
          <TextInput
            testID="goal-discovery-more-input"
            className="border border-cyan-400 rounded-lg p-3 text-base text-[#E6FAFF] bg-slate-800"
            placeholder="Ask me more questions…"
            placeholderTextColor="#708090"
            value={input}
            onChangeText={setInput}
          />
          <SecondaryButton
            testID="goal-discovery-ask-more"
            title={`Ask me more questions (${2 - extraTurns} left)`}
            onPress={handleSend}
          />
        </View>
      )}
    </View>
  );
}
