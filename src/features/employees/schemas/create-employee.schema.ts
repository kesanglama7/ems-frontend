import { z } from "zod";

export const createEmployeeSchema =
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(
        100,
        "First name must be 100 characters or less.",
      ),

    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(
        100,
        "Last name must be 100 characters or less.",
      ),

    email: z
      .string()
      .trim()
      .email(
        "Enter a valid email address.",
      ),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters.",
      ),

    phone: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^(97|98)\d{8}$/.test(value),
      {
        message:
          "Enter a valid 10-digit Nepal mobile number starting with 97 or 98.",
      },
    ),

    jobTitle: z
      .string()
      .trim()
      .max(
        150,
        "Job title must be 150 characters or less.",
      ),

    departmentId: z.union([
      z.literal(""),
      z
        .string()
        .uuid(
          "Select a valid department.",
        ),
    ]),

    dateOfJoining: z.union([
      z.literal(""),
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Enter a valid joining date.",
        ),
    ]),
  });

export type CreateEmployeeFormValues =
  z.infer<
    typeof createEmployeeSchema
  >;