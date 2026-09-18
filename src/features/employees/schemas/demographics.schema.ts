import { z } from "zod";
export const dateOfBirthField = z.string().refine((value) => {
  if (!value) return true;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date <= new Date()
  );
}, "Enter a valid date of birth that is not in the future.");
export const genderField = z.enum(["", "MALE", "FEMALE", "OTHER"]);
