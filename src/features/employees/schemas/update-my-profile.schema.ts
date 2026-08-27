import { z } from "zod";

export const updateMyProfileSchema = z.object({
  phone: z
    .string()
    .max(
      30,
      "Phone number must be 30 characters or fewer.",
    ),
});

export type UpdateMyProfileFormValues =
  z.infer<typeof updateMyProfileSchema>;
