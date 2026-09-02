import { z } from "zod";

export const reviewLeaveSchema = z.object({
  note: z
    .string()
    .trim()
    .max(500, "Note must be 500 characters or less."),
});

export type ReviewLeaveFormValues = z.infer<typeof reviewLeaveSchema>;
