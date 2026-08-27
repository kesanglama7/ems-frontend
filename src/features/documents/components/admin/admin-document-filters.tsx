"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DOCUMENT_TYPES } from "../../constants/document.constants";
import type {
  AdminDocumentListFilters,
  DocumentStatus,
  DocumentType,
} from "../../types/document.types";
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
} from "../../utils/document.utils";

const DOCUMENT_STATUSES = [
  "PENDING",
  "VERIFIED",
  "REJECTED",
] as const satisfies readonly DocumentStatus[];

const ALL_FILTER_VALUE = "ALL";

export interface AdminDocumentEmployeeOption {
  id: string;
  label: string;
}

interface AdminDocumentFiltersProps {
  filters: AdminDocumentListFilters;

  onFiltersChange: (
    filters: AdminDocumentListFilters,
  ) => void;

  employeeOptions?: AdminDocumentEmployeeOption[];

  isEmployeeOptionsLoading?: boolean;
}

export function AdminDocumentFilters({
  filters,
  onFiltersChange,
  employeeOptions,
  isEmployeeOptionsLoading = false,
}: AdminDocumentFiltersProps) {
  const hasFilters =
    Boolean(filters.employeeId) ||
    Boolean(filters.status) ||
    Boolean(filters.type);

  const selectedEmployee =
    filters.employeeId && employeeOptions
      ? employeeOptions.find(
          (employee) =>
            employee.id === filters.employeeId,
        )
      : undefined;

  const selectedEmployeeLabel =
    selectedEmployee?.label ?? "All employees";

  const selectedStatusLabel =
    filters.status
      ? DOCUMENT_STATUS_LABELS[
          filters.status
        ]
      : "All statuses";

  const selectedTypeLabel =
    filters.type
      ? DOCUMENT_TYPE_LABELS[
          filters.type
        ]
      : "All document types";

  function handleEmployeeChange(
    value: string | null,
  ) {
    onFiltersChange({
      ...filters,
      employeeId:
        !value || value === ALL_FILTER_VALUE
          ? undefined
          : value,
    });
  }

  function handleStatusChange(
    value: string | null,
  ) {
    onFiltersChange({
      ...filters,
      status:
        !value || value === ALL_FILTER_VALUE
          ? undefined
          : (value as DocumentStatus),
    });
  }

  function handleTypeChange(
    value: string | null,
  ) {
    onFiltersChange({
      ...filters,
      type:
        !value || value === ALL_FILTER_VALUE
          ? undefined
          : (value as DocumentType),
    });
  }

  function handleReset() {
    onFiltersChange({});
  }

  return (
    <div className="flex md:items-center justify-between gap-3 rounded-lg border bg-card p-4">
        <div className="flex flex-1 gap-y-4 md:flex-row md:gap-6">
            {employeeOptions && (
                <div className="space-y-2">
                <Label>Employee</Label>

                <Select
                    value={
                    filters.employeeId ??
                    ALL_FILTER_VALUE
                    }
                    onValueChange={
                    handleEmployeeChange
                    }
                    disabled={
                    isEmployeeOptionsLoading
                    }
                >
                    <SelectTrigger className="w-full lg:w-64">
                    <SelectValue>
                        {isEmployeeOptionsLoading
                        ? "Loading employees..."
                        : selectedEmployeeLabel}
                    </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                    <SelectItem
                        value={ALL_FILTER_VALUE}
                    >
                        All employees
                    </SelectItem>

                    {employeeOptions.map(
                        (employee) => (
                        <SelectItem
                            key={employee.id}
                            value={employee.id}
                        >
                            {employee.label}
                        </SelectItem>
                        ),
                    )}
                    </SelectContent>
                </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label>Status</Label>

                <Select
                value={
                    filters.status ??
                    ALL_FILTER_VALUE
                }
                onValueChange={
                    handleStatusChange
                }
                >
                <SelectTrigger className="w-full lg:w-48">
                    <SelectValue>
                    {selectedStatusLabel}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent>
                    <SelectItem
                    value={ALL_FILTER_VALUE}
                    >
                    All statuses
                    </SelectItem>

                    {DOCUMENT_STATUSES.map(
                    (status) => (
                        <SelectItem
                        key={status}
                        value={status}
                        >
                        {
                            DOCUMENT_STATUS_LABELS[
                            status
                            ]
                        }
                        </SelectItem>
                    ),
                    )}
                </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Type</Label>

                <Select
                value={
                    filters.type ??
                    ALL_FILTER_VALUE
                }
                onValueChange={
                    handleTypeChange
                }
                >
                <SelectTrigger className="w-full lg:w-52">
                    <SelectValue>
                    {selectedTypeLabel}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent>
                    <SelectItem
                    value={ALL_FILTER_VALUE}
                    >
                    All document types
                    </SelectItem>

                    {DOCUMENT_TYPES.map(
                    (type) => (
                        <SelectItem
                        key={type}
                        value={type}
                        >
                        {
                            DOCUMENT_TYPE_LABELS[
                            type
                            ]
                        }
                        </SelectItem>
                    ),
                    )}
                </SelectContent>
                </Select>
            </div>
        </div>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleReset}
        >
          <RotateCcw className="size-4" />
          Reset filters
        </Button>
      )}
    </div>
  );
}