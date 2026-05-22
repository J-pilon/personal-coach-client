import { z } from "zod";

export const journalEntryTypeSchema = z.enum([
  "daily_journal",
  "weekly_reflection",
  "general",
]);

export type JournalEntryType = z.infer<typeof journalEntryTypeSchema>;

export const journalSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable().optional(),
  kind: z.literal("default"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type JournalModel = z.infer<typeof journalSchema>;

export const journalEntrySchema = z.object({
  id: z.number().int().positive(),
  journal_id: z.number().int().positive(),
  profile_id: z.number().int().positive(),
  title: z.string().trim().max(200),
  body: z.string().trim().min(1, "Please write something"),
  entry_type: journalEntryTypeSchema,
  occurred_on: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type JournalEntryModel = z.infer<typeof journalEntrySchema>;

export const journalEntryFormSchema = journalEntrySchema.pick({
  title: true,
  body: true,
  entry_type: true,
  occurred_on: true,
});

export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;
