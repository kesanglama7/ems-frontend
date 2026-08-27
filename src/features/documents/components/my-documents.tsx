"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api-error";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";

import { useDeleteDocument } from "../hooks/use-delete-document";
import { useDocumentFile } from "../hooks/use-document-file";
import { useMyDocuments } from "../hooks/use-my-documents";

import type { EmployeeDocument } from "../types/document.types";

import { DocumentPreviewDialog } from "./document-preview-dialog";
import { DocumentsEmptyState } from "./documents-empty-state";
import { DocumentsErrorState } from "./documents-error-state";
import { DocumentsTable } from "./documents-table";
import { DocumentsTableSkeleton } from "./documents-table-skeleton";
import { UploadDocumentDialog } from "./upload-document-dialog";
import { DocumentDetailsDialog } from "./document-details-dialog";

export function MyDocuments() {
  const {
    data: documents,
    error,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useMyDocuments();

  const confirm = useConfirmDialogStore(
    (state) => state.confirm,
  );

  const deleteDocument = useDeleteDocument();
  const documentFile = useDocumentFile();

  const [detailsDocument, setDetailsDocument] =
  useState<EmployeeDocument | null>(
    null,
  );

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [previewDocument, setPreviewDocument] =
    useState<EmployeeDocument | null>(null);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  function handlePreview(
    document: EmployeeDocument,
  ) {
    documentFile.reset();

    setPreviewDocument(document);
    setPreviewOpen(true);

    documentFile.mutate(document.id);
  }

  function handlePreviewOpenChange(
    open: boolean,
  ) {
    setPreviewOpen(open);

    if (!open) {
      documentFile.reset();
      setPreviewDocument(null);
    }
  }

  function handleDetails(
    document: EmployeeDocument,
    ) {
    setDetailsDocument(document);
    setDetailsOpen(true);
    }
    function handleDetailsOpenChange(
    open: boolean,
    ) {
    setDetailsOpen(open);

    if (!open) {
        setDetailsDocument(null);
    }
    }

  function handleDeleteRequest(
    document: EmployeeDocument,
  ) {
    confirm({
      title: "Delete document?",
      description: `Are you sure you want to delete "${document.title}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,

      onConfirm: async () => {
        await deleteDocument.mutateAsync(
          document.id,
        );
      },
    });
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="size-5" />

              <h1 className="text-2xl font-semibold tracking-tight">
                Documents
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage and review your employee
              documents.
            </p>
          </div>

          <UploadDocumentDialog />
        </div>

        {isLoading && (
          <DocumentsTableSkeleton />
        )}

        {isError && (
          <DocumentsErrorState
            message={getApiErrorMessage(error)}
            isRetrying={isFetching}
            onRetry={() => {
              void refetch();
            }}
          />
        )}

        {!isLoading &&
          !isError &&
          documents?.length === 0 && (
            <DocumentsEmptyState />
          )}

        {!isLoading &&
          !isError &&
          documents &&
          documents.length > 0 && (
            <DocumentsTable
              documents={documents}
              onDetails={handleDetails}
              onPreview={handlePreview}
              onDelete={handleDeleteRequest}
            />
          )}
      </div>

      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={handlePreviewOpenChange}
        document={previewDocument}
        file={documentFile.data}
        isLoading={documentFile.isPending}
        error={documentFile.error}
        onRetry={() => {
          if (!previewDocument) {
            return;
          }

          documentFile.mutate(
            previewDocument.id,
          );
        }}
      />
      <DocumentDetailsDialog
        open={detailsOpen}
        onOpenChange={
            handleDetailsOpenChange
        }
        document={detailsDocument}
        />
    </>
  );
}