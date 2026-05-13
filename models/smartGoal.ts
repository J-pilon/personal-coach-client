import { z } from 'zod';

export const timeframeSchema = z.enum(['1_month', '3_months', '6_months']);

export const smartGoalSchema = z.object({
  id: z.number().int().positive().optional(),
  profile_id: z.number().int().positive(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  timeframe: timeframeSchema,
  specific: z.string().trim().min(1),
  measurable: z.string().trim().min(1),
  achievable: z.string().trim().min(1),
  relevant: z.string().trim().min(1),
  time_bound: z.string().trim().min(1),
  completed: z.boolean(),
  target_date: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type SmartGoalModel = z.infer<typeof smartGoalSchema>;
export type Timeframe = z.infer<typeof timeframeSchema>;
