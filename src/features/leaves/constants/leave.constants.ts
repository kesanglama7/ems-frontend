import type { LeaveStatus } from "../types/leave.types";

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  AUTO_REJECTED: "Auto rejected",
};

export const leaveKeys = {
  all: ["leaves"] as const,

  types: () => [...leaveKeys.all, "types"] as const,
  type: (id: string) => [...leaveKeys.types(), id] as const,

  my: () => [...leaveKeys.all, "my"] as const,
  myDetail: (id: string) => [...leaveKeys.my(), id] as const,
  myBalance: (year: number) => [...leaveKeys.my(), "balance", year] as const,

  admin: () => [...leaveKeys.all, "admin"] as const,
  adminList: (filters: object) =>
    [...leaveKeys.admin(), "list", filters] as const,
  adminDetail: (id: string) =>
    [...leaveKeys.admin(), "detail", id] as const,
  adminSummary: (year: number) => [...leaveKeys.admin(), "summary", year] as const,
  adminBalances: (year: number) => [...leaveKeys.admin(), "balances", year] as const,
};
