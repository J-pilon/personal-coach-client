import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password is too long');

export const userSchema = z.object({
  id: z.number().int().positive(),
  email: emailSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserModel = z.infer<typeof userSchema>;
