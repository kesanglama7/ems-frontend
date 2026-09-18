import { z } from "zod";
export const leaveAssignmentSchema = z.object({
  leaveTypeId: z.string().uuid("Choose a leave type."),
  action: z.enum(["assign", "remove"]),
  employeeIds: z
    .array(z.string().uuid())
    .min(1, "Select at least one employee.")
    .max(100, "Select no more than 100 employees.")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate employees are not allowed.",
    ),
});
export type LeaveAssignmentFormValues = z.infer<typeof leaveAssignmentSchema>;
