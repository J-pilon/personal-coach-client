import { z } from 'zod';

export const habitCompletionStateSchema = z.enum([
  'committed',
  'completed_minimum',
  'completed_normal',
  'skipped',
]);

export const habitCompletionSchema = z.object({
  id: z.number().int().positive(),
  habit_id: z.number().int().positive(),
  completed_on: z.string(),
  state: habitCompletionStateSchema,
  committed_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type HabitCompletionModel = z.infer<typeof habitCompletionSchema>;
export type HabitCompletionState = z.infer<typeof habitCompletionStateSchema>;

export interface CreateHabitCompletionParams {
  habit_id: number;
  completed_on?: string;
  state?: HabitCompletionState;
  note?: string | null;
}
