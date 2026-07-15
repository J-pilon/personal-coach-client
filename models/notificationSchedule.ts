import { z } from 'zod';

export const notificationScheduleKindSchema = z.literal('daily_check_in');

export const notificationScheduleSchema = z.object({
  id: z.number().int().positive(),
  profile_id: z.number().int().positive(),
  kind: notificationScheduleKindSchema,
  local_time: z.string(),
  timezone: z.string().trim().min(1),
  active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type NotificationScheduleModel = z.infer<typeof notificationScheduleSchema>;
export type NotificationScheduleKind = z.infer<typeof notificationScheduleKindSchema>;

export interface UpsertNotificationScheduleParams {
  kind: NotificationScheduleKind;
  local_time: string;
  timezone: string;
  active: boolean;
}
