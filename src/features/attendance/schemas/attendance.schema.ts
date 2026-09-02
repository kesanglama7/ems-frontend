import { z } from "zod";

export const createAttendanceSchema = z
  .object({
    employeeId: z.string().min(1, "Please select an employee."),
    checkInAt: z.string().min(1, "Check-in time is required."),
    checkOutAt: z.string().optional(),
    reason: z
      .string()
      .trim()
      .min(1, "Reason is required.")
      .max(500, "Reason must be 500 characters or less."),
  })
  .refine(
    (data) => {
      if (!data.checkOutAt) return true;
      return new Date(data.checkOutAt) > new Date(data.checkInAt);
    },
    {
      message: "Check-out time must be after check-in time.",
      path: ["checkOutAt"],
    },
  );

export type CreateAttendanceFormValues = z.infer<typeof createAttendanceSchema>;

export const correctAttendanceSchema = z
  .object({
    checkInAt: z.string().optional(),
    checkOutAt: z.string().optional(),
    reason: z
      .string()
      .trim()
      .min(1, "Reason is required.")
      .max(500, "Reason must be 500 characters or less."),
  })
  .refine(
    (data) => {
      if (!data.checkInAt || !data.checkOutAt) return true;
      return new Date(data.checkOutAt) > new Date(data.checkInAt);
    },
    {
      message: "Check-out time must be after check-in time.",
      path: ["checkOutAt"],
    },
  )
  .refine((data) => data.checkInAt || data.checkOutAt, {
    message: "Please provide at least a check-in or check-out time.",
    path: ["checkInAt"],
  });

export type CorrectAttendanceFormValues = z.infer<
  typeof correctAttendanceSchema
>;
