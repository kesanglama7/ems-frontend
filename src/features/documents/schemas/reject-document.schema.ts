import { z } from "zod";

export const rejectDocumentSchema = z.object({
  note: z
    .string()
    .trim()
    .min(
      1,
      "Rejection reason is required.",
    )
    .max(
      500,
      "Rejection reason must be 500 characters or less.",
    ),
});

export type RejectDocumentFormValues =
  z.infer<typeof rejectDocumentSchema>;