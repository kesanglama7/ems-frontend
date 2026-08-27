"use client";

import { useState } from "react";
import { Files } from "lucide-react";

import { useAdminDocumentFile } from "../../hooks/use-admin-document-file";
import type { AdminDocumentListItem } from "../../types/document.types";

import { AdminDocumentDetailsDialog } from "./admin-document-details-dialog";
import { AdminDocumentPreviewDialog } from "./admin-document-preview-dialog";
import { AdminDocumentsList } from "./admin-documents-list";
import { AdminRejectDocumentDialog } from "./admin-reject-document-dialog";
import { AdminVerifyDocumentDialog } from "./admin-verify-document-dialog";

export function AdminDocuments() {
  const documentFile =
    useAdminDocumentFile();

  const [
    detailsDocumentId,
    setDetailsDocumentId,
  ] = useState<string | null>(null);

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [
    previewDocument,
    setPreviewDocument,
  ] =
    useState<AdminDocumentListItem | null>(
      null,
    );

  const [
    previewOpen,
    setPreviewOpen,
  ] = useState(false);

  const [
    verifyDocument,
    setVerifyDocument,
  ] =
    useState<AdminDocumentListItem | null>(
      null,
    );

  const [
    verifyOpen,
    setVerifyOpen,
  ] = useState(false);

  const [
    rejectDocument,
    setRejectDocument,
  ] =
    useState<AdminDocumentListItem | null>(
      null,
    );

  const [
    rejectOpen,
    setRejectOpen,
  ] = useState(false);

  function handleDetails(
    document: AdminDocumentListItem,
  ) {
    setDetailsDocumentId(document.id);
    setDetailsOpen(true);
  }

  function handleDetailsOpenChange(
    open: boolean,
  ) {
    setDetailsOpen(open);

    if (!open) {
      setDetailsDocumentId(null);
    }
  }

  function handlePreview(
    document: AdminDocumentListItem,
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

  function handlePreviewRetry() {
    if (!previewDocument) {
      return;
    }

    documentFile.mutate(
      previewDocument.id,
    );
  }

  function handleVerify(
    document: AdminDocumentListItem,
  ) {
    setVerifyDocument(document);
    setVerifyOpen(true);
  }

  function handleVerifyOpenChange(
    open: boolean,
  ) {
    setVerifyOpen(open);

    if (!open) {
      setVerifyDocument(null);
    }
  }

  function handleReject(
    document: AdminDocumentListItem,
  ) {
    setRejectDocument(document);
    setRejectOpen(true);
  }

  function handleRejectOpenChange(
    open: boolean,
  ) {
    setRejectOpen(open);

    if (!open) {
      setRejectDocument(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Files className="size-5" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Employee Documents
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Review, verify, and manage
            employee document submissions.
          </p>
        </div>

        <AdminDocumentsList
          onDetails={handleDetails}
          onPreview={handlePreview}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      </div>

      <AdminDocumentDetailsDialog
        documentId={detailsDocumentId}
        open={detailsOpen}
        onOpenChange={
          handleDetailsOpenChange
        }
      />

      <AdminDocumentPreviewDialog
        document={previewDocument}
        open={previewOpen}
        onOpenChange={
          handlePreviewOpenChange
        }
        file={documentFile.data}
        isLoading={
          documentFile.isPending
        }
        error={documentFile.error}
        onRetry={handlePreviewRetry}
      />

      <AdminVerifyDocumentDialog
        document={verifyDocument}
        open={verifyOpen}
        onOpenChange={
          handleVerifyOpenChange
        }
      />

      <AdminRejectDocumentDialog
        document={rejectDocument}
        open={rejectOpen}
        onOpenChange={
          handleRejectOpenChange
        }
      />
    </>
  );
}