import { z } from "zod";

const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Enter a valid time.",
  );

const workingDaySchema = z.enum([
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);

export const updateOfficeSettingSchema =
  z
    .object({
      officeName: z
        .string()
        .trim()
        .min(
          1,
          "Office name is required.",
        )
        .max(
          150,
          "Office name cannot exceed 150 characters.",
        ),

      timezone: z
        .string()
        .min(
          1,
          "Timezone is required.",
        ),

      workStartTime: timeSchema,
      workEndTime: timeSchema,

      workingDays: z
        .array(workingDaySchema)
        .min(
          1,
          "Select at least one working day.",
        ),

      gracePeriodMinutes: z
        .number()
        .int(
          "Grace period must be a whole number.",
        )
        .min(
          0,
          "Grace period cannot be negative.",
        )
        .max(
          180,
          "Grace period cannot exceed 180 minutes.",
        ),

      officeLatitude: z
        .number()
        .min(-90)
        .max(90)
        .nullable(),

      officeLongitude: z
        .number()
        .min(-180)
        .max(180)
        .nullable(),

      officeAddress: z
        .string()
        .trim()
        .max(
          500,
          "Office address cannot exceed 500 characters.",
        ),

      attendanceRadiusMeters: z
        .number()
        .int(
          "Attendance radius must be a whole number.",
        )
        .min(
          20,
          "Attendance radius must be at least 20 meters.",
        )
        .max(
          5000,
          "Attendance radius cannot exceed 5000 meters.",
        ),
    })
    .superRefine((data, ctx) => {
      const hasLatitude =
        data.officeLatitude !== null;

      const hasLongitude =
        data.officeLongitude !== null;

      if (hasLatitude !== hasLongitude) {
        ctx.addIssue({
          code: "custom",
          path: ["officeLatitude"],
          message:
            "Select a complete office location.",
        });
      }

      if (
        data.workStartTime >=
        data.workEndTime
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["workEndTime"],
          message:
            "Work end time must be later than work start time.",
        });
      }
    });

export type UpdateOfficeSettingFormValues =
  z.infer<
    typeof updateOfficeSettingSchema
  >;