import { z } from 'zod';

export const habitFrequencySchema = z.enum([
  'daily',
  'weekdays',
  'weekly_n_times',
  'custom',
]);

export const habitPositionSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const habitSchema = z.object({
  id: z.number().int().positive(),
  profile_id: z.number().int().positive(),
  smart_goal_id: z.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  frequency: habitFrequencySchema,
  frequency_config: z.record(z.string(), z.any()).nullable().optional(),
  cue: z.string().trim().max(500).nullable().optional(),
  minimum_version: z.string().trim().max(500),
  normal_version: z.string().trim().max(500),
  position: habitPositionSchema,
  archived_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type HabitModel = z.infer<typeof habitSchema>;
export type HabitFrequency = z.infer<typeof habitFrequencySchema>;
export type HabitPosition = z.infer<typeof habitPositionSchema>;

export interface CreateHabitParams {
  title: string;
  frequency: HabitFrequency;
  frequency_config?: Record<string, unknown> | null;
  cue?: string | null;
  minimum_version: string;
  normal_version: string;
  position: HabitPosition;
}
