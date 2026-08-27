"use client";

import { useMemo, useState } from "react";

import { getApiErrorMessage } from "@/lib/api-error";

import { useAdminDocuments } from "../../hooks/use-admin-documents";
import type {
  AdminDocumentListFilters,
  AdminDocumentListItem,
} from "../../types/document.types";

import {
  AdminDocumentFilters,
  type AdminDocumentEmployeeOption,
} from "./admin-document-filters";
import { AdminDocumentsEmptyState } from "./admin-documents-empty-state";
import { AdminDocumentsErrorState } from "./admin-documents-error-state";
import { AdminDocumentsTable } from "./admin-documents-table";
import { AdminDocumentsTableSkeleton } from "./admin-documents-table-skeleton";

interface AdminDocumentsListProps {
  onDetails: (
    document: AdminDocumentListItem,
  ) => void;

  onPreview: (
    document: AdminDocumentListItem,
  ) => void;

  onVerify: (
    document: AdminDocumentListItem,
  ) => void;

  onReject: (
    document: AdminDocumentListItem,
  ) => void;
}

export function AdminDocumentsList({
  onDetails,
  onPreview,
  onVerify,
  onReject,
}: AdminDocumentsListProps) {
  const [filters, setFilters] =
    useState<AdminDocumentListFilters>({});

  /**
   * Main filtered document query.
   */
  const {
    data: documents,
    error,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useAdminDocuments(filters);

  /**
   * Keep one unfiltered document query available
   * for building employee filter options.
   *
   * TanStack Query will reuse this same cache entry
   * when filters are currently empty.
   */
  const {
    data: allDocuments,
    isLoading: isEmployeeOptionsLoading,
  } = useAdminDocuments({});

  const employeeOptions =
    useMemo<AdminDocumentEmployeeOption[]>(
      () => {
        if (!allDocuments) {
          return [];
        }

        const employees = new Map<
          string,
          AdminDocumentEmployeeOption
        >();

        for (const document of allDocuments) {
          const employee =
            document.employee;

          if (employees.has(employee.id)) {
            continue;
          }

          const fullName =
            `${employee.firstName} ${employee.lastName}`.trim();

          employees.set(employee.id, {
            id: employee.id,
            label: fullName
              ? `${fullName} (${employee.employeeCode})`
              : employee.employeeCode,
          });
        }

        return Array.from(
          employees.values(),
        ).sort((a, b) =>
          a.label.localeCompare(b.label),
        );
      },
      [allDocuments],
    );

  const hasFilters =
    Boolean(filters.employeeId) ||
    Boolean(filters.status) ||
    Boolean(filters.type);

  function handleResetFilters() {
    setFilters({});
  }

  return (
    <div className="space-y-4">
      <AdminDocumentFilters
        filters={filters}
        onFiltersChange={setFilters}
        employeeOptions={employeeOptions}
        isEmployeeOptionsLoading={
          isEmployeeOptionsLoading
        }
      />

      {!isLoading &&
        !isError &&
        documents && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {documents.length === 1
                ? "1 document"
                : `${documents.length} documents`}
            </p>

            {isFetching && (
              <p className="text-xs text-muted-foreground">
                Updating...
              </p>
            )}
          </div>
        )}

      {isLoading && (
        <AdminDocumentsTableSkeleton />
      )}

      {isError && (
        <AdminDocumentsErrorState
          message={getApiErrorMessage(
            error,
          )}
          isRetrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {!isLoading &&
        !isError &&
        documents?.length === 0 && (
          <AdminDocumentsEmptyState
            hasFilters={hasFilters}
            onResetFilters={
              handleResetFilters
            }
          />
        )}

      {!isLoading &&
        !isError &&
        documents &&
        documents.length > 0 && (
          <AdminDocumentsTable
            documents={documents}
            onDetails={onDetails}
            onPreview={onPreview}
            onVerify={onVerify}
            onReject={onReject}
          />
        )}
    </div>
  );
}