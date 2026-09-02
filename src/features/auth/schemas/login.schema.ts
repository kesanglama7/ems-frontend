import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address."),

  password: z
    .string()
    .min(1, "Password is required."),

  authMode: z.enum(["COOKIE", "JWT"], {
    error: "Authentication mode is required.",
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;