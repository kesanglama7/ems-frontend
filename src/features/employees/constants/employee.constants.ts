import type { EmployeeListQuery } from "../types/employee.types";

export const employeeKeys = {
  all: ["employees"] as const,

  me: () => [...employeeKeys.all, "me"] as const,

  lists: () =>
    [...employeeKeys.all, "list"] as const,

  list: (filters: EmployeeListQuery) =>
    [...employeeKeys.lists(), filters] as const,

  details: () =>
    [...employeeKeys.all, "detail"] as const,

  detail: (employeeId: string) =>
    [...employeeKeys.details(), employeeId] as const,

  colleagues: () => [...employeeKeys.all, "colleagues"] as const,
};


export const PROFILE_IMAGE_MAX_SIZE =
  3 * 1024 * 1024;

export const PROFILE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
