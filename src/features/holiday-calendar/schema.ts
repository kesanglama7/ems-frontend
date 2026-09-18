import { z } from "zod";

export const holidaySchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(160),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.")
    .refine((value) => {
      const parsed = new Date(`${value}T12:00:00Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }, "Choose a valid date."),
  description: z.string().trim().max(1000),
  isOfficeClosed: z.boolean(),
});

export type HolidayFormValues = z.infer<typeof holidaySchema>;
