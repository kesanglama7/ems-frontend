import { z } from "zod";

export const leaveTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Leave type name must be at least 2 characters.")
    .max(100, "Leave type name must be 100 characters or less."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less."),
  yearlyAllowance: z.number().min(0).max(365),
  hasLimitedBalance: z.boolean(),
  allowHalfDay: z.boolean(),
  isEmployeeRequestable: z.boolean(),
  isPaid: z.boolean(),
});

export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;
