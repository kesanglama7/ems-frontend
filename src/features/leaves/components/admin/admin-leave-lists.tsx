"use client";

import { useCallback, useState } from "react";

import type { AdminLeaveQueryParams } from "../../types/leave.types";
import { LeaveRequestFilters } from "./leave-request-filters";
import { LeaveRequestList } from "./leave-request-list";

export function AdminLeaveLists() {
  const [filters, setFilters] = useState<AdminLeaveQueryParams>({});

  const handleFiltersChange = useCallback(
    (newFilters: AdminLeaveQueryParams) => {
      setFilters(newFilters);
    },
    [],
  );

  return (
    <main className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Leave Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and process employee leave requests
        </p>
      </div>

      <LeaveRequestFilters onFiltersChange={handleFiltersChange} />
      <LeaveRequestList filters={filters} />
    </main>
  );
}
