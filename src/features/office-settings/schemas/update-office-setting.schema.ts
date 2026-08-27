import { z } from "zod";
import { WORKING_DAYS } from "../types/office-settings.types";

export const updateOfficeSettingSchema = z.object({
  officeName: z.string().min(1, "Office name is required").optional(),
  timezone: z.string().min(1, "Timezone is required").optional(),
  workStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)").optional(),
  workEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)").optional(),
  workingDays: z.array(z.enum(WORKING_DAYS)).min(1, "At least one working day is required").optional(),
  gracePeriodMinutes: z.number().int().min(0, "Grace period must be at least 0").optional(),
});
