import { z } from 'zod';

export const taskActionCategorySchema = z.enum(['do', 'defer', 'delegate']);

export const taskPrioritySchema = z.number().int().min(1).max(3);

export const taskSchema = z.object({
  id: z.number().int().positive().optional(),
  profile_id: z.number().int().positive(),
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().trim().max(2000).optional(),
  completed: z.boolean(),
  action_category: taskActionCategorySchema,
  priority: taskPrioritySchema.optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type TaskModel = z.infer<typeof taskSchema>;
export type TaskActionCategory = z.infer<typeof taskActionCategorySchema>;
