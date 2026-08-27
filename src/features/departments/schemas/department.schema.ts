import { z } from "zod";

export const departmentSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        1,
        "Department name is required.",
      )
      .max(
        100,
        "Department name must be 100 characters or less.",
      ),

    description: z
      .string()
      .trim()
      .max(
        500,
        "Description must be 500 characters or less.",
      ),
  });

export type DepartmentFormValues =
  z.infer<
    typeof departmentSchema
  >;