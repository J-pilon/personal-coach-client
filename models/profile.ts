import { z } from 'zod';

export const onboardingStatusSchema = z.enum(['incomplete', 'complete']);

export const profileSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  first_name: z.string().trim().max(100).optional(),
  last_name: z.string().trim().max(100).optional(),
  work_role: z.string().trim().max(200).optional(),
  education: z.string().trim().max(200).optional(),
  desires: z.string().trim().max(2000).optional(),
  limiting_beliefs: z.string().trim().max(2000).optional(),
  timezone: z.string().trim().max(64).optional(),
  onboarding_status: onboardingStatusSchema,
  onboarding_completed_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileModel = z.infer<typeof profileSchema>;
