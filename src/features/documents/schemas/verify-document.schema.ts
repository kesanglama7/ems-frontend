import { z } from "zod";

export const verifyDocumentSchema = z.object({
  note: z
    .string()
    .max(
      500,
      "Verification note must be 500 characters or less.",
    ),
});

export type VerifyDocumentFormValues =
  z.infer<typeof verifyDocumentSchema>;