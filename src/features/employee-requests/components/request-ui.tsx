import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { REQUEST_CATEGORIES, REQUEST_PRIORITIES, REQUEST_STATUSES, labelFor } from "../constants/employee-request.constants";
import type { EmployeeRequest, RequestPriority, RequestStatus } from "../types/employee-request.types";

export function requestCode(requestNumber: number) {
  return `REQ-${String(requestNumber).padStart(5, "0")}`;
}

export function employeeName(request: EmployeeRequest) {
  return `${request.employee.firstName} ${request.employee.lastName}`.trim();
}

export function EmployeeAvatar({ request, className }: { request: EmployeeRequest; className?: string }) {
  const initials = `${request.employee.firstName[0] ?? ""}${request.employee.lastName[0] ?? ""}`.toUpperCase();
  return (
    <Avatar className={className}>
      <AvatarImage src={request.employee.profileImageUrl ?? undefined} alt={employeeName(request)} />
      <AvatarFallback>{initials || "E"}</AvatarFallback>
    </Avatar>
  );
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const className =
    status === "RESOLVED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
      : status === "IN_PROGRESS"
        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300"
      : status === "REJECTED"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          : status === "DISMISSED"
            ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-300"
          : status === "CANCELLED"
              ? "border-border bg-muted text-muted-foreground"
              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300";
  return <Badge variant="outline" className={className}>{labelFor(REQUEST_STATUSES, status)}</Badge>;
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  const dotClass =
    priority === "URGENT"
      ? "bg-red-500"
      : priority === "HIGH"
        ? "bg-orange-500"
        : priority === "NORMAL"
          ? "bg-blue-500"
          : "bg-slate-400";
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <span className={cn("size-1.5 rounded-full", dotClass)} />
      {labelFor(REQUEST_PRIORITIES, priority)}
    </Badge>
  );
}

export function CategoryLabel({ request }: { request: EmployeeRequest }) {
  return <>{labelFor(REQUEST_CATEGORIES, request.category)}</>;
}
