import { z } from "zod";

export const createLeaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1, "Please select a leave type."),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    reason: z
      .string()
      .trim()
      .max(500, "Reason must be 500 characters or less."),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date.",
    path: ["endDate"],
  });

export type CreateLeaveRequestFormValues = z.infer<
  typeof createLeaveRequestSchema
>;
