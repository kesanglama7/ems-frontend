import type { RequestCategory, RequestPriority, RequestStatus } from "../types/employee-request.types";

export const REQUEST_CATEGORIES: { value: RequestCategory; label: string }[] = [
  { value: "ATTENDANCE_CORRECTION", label: "Attendance correction" }, { value: "PROFILE_UPDATE", label: "Profile update" },
  { value: "DOCUMENT", label: "Document" }, { value: "LEAVE", label: "Leave" }, { value: "PAYROLL", label: "Payroll" },
  { value: "TECHNICAL_SUPPORT", label: "Technical support" }, { value: "WORKPLACE_CONCERN", label: "Workplace concern" },
  { value: "GENERAL_QUESTION", label: "General question" }, { value: "OTHER", label: "Other" },
];
export const REQUEST_PRIORITIES: { value: RequestPriority; label: string }[] = [
  { value: "LOW", label: "Low" }, { value: "NORMAL", label: "Normal" }, { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" },
];
export const REQUEST_STATUSES: { value: RequestStatus; label: string }[] = [
  { value: "OPEN", label: "Open" }, { value: "IN_PROGRESS", label: "In progress" }, { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" }, { value: "DISMISSED", label: "Dismissed" }, { value: "CANCELLED", label: "Cancelled" },
];
export const REQUEST_DISMISSAL_REASONS = [
  { value: "SPAM_OR_INAPPROPRIATE", label: "Spam or inappropriate content" },
  { value: "DUPLICATE", label: "Duplicate request" },
  { value: "INVALID_REQUEST", label: "Invalid request" },
  { value: "INSUFFICIENT_INFORMATION", label: "Insufficient information" },
  { value: "OTHER", label: "Other" },
] as const;
export const labelFor = <T extends string>(items: { value: T; label: string }[], value: T) => items.find((item) => item.value === value)?.label ?? value;
