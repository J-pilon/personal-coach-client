import { z } from 'zod';
import { timeframeSchema } from './smartGoal';

export const discoveryQuestionSchema = z.object({
  kind: z.literal('question'),
  text: z.string().min(1),
});

export const smartGoalDraftSchema = z.object({
  kind: z.literal('smart_goal_draft'),
  goal: z.object({
    title: z.string().trim().min(1).max(200),
    why: z.string().trim().max(2000).nullable().optional(),
    specific: z.string().trim().min(1),
    measurable: z.string().trim().min(1),
    time_bound: z.string().trim().min(1),
    target_date: z.string().optional(),
    timeframe: timeframeSchema,
  }),
});

export const discoveryTurnSchema = z.discriminatedUnion('kind', [
  discoveryQuestionSchema,
  smartGoalDraftSchema,
]);

export type DiscoveryQuestion = z.infer<typeof discoveryQuestionSchema>;
export type SmartGoalDraft = z.infer<typeof smartGoalDraftSchema>;
export type DiscoveryTurn = z.infer<typeof discoveryTurnSchema>;

export const onboardingResumeSchema = z.object({
  current_step: z.number().int().min(0).max(5),
  smart_goal_id: z.number().int().positive().nullable().optional(),
  habit_ids: z.array(z.number().int().positive()).optional(),
  completion_id: z.number().int().positive().nullable().optional(),
  schedule_id: z.number().int().positive().nullable().optional(),
});

export type OnboardingResumeResponse = z.infer<typeof onboardingResumeSchema>;

export interface StartDiscoveryResponse {
  session_id: number;
  ai_request_id: number;
  job_id: string;
  status: 'queued' | 'working' | 'complete' | 'failed';
}

export interface DiscoveryMessageResponse extends StartDiscoveryResponse {
  force_draft: boolean;
  turn_count: number;
}

export interface SuggestHabitsResponse {
  ai_request_id: number;
  job_id: string;
  status: 'queued' | 'working' | 'complete' | 'failed';
}
