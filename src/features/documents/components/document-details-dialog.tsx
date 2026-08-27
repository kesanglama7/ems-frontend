"use client";

import {
  CalendarDays,
  FileText,
  HardDrive,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import type { EmployeeDocument } from "../types/document.types";
import {
  DOCUMENT_TYPE_LABELS,
  formatDocumentDate,
  formatFileSize,
} from "../utils/document.utils";

import { DocumentStatusBadge } from "./document-status-badge";

interface DocumentDetailsDialogProps {
  document: EmployeeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentDetailsDialog({
  document,
  open,
  onOpenChange,
}: DocumentDetailsDialogProps) {
  if (!document) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Document details
          </DialogTitle>

          <DialogDescription>
            Review information about this
            document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
              <FileText className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">
                {document.title}
              </h3>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                {document.originalFileName}
              </p>
            </div>

            <DocumentStatusBadge
              status={document.status}
            />
          </div>

          <Separator />

          <div className="grid gap-5 sm:grid-cols-2">
            <DetailItem
              label="Document type"
              value={
                DOCUMENT_TYPE_LABELS[
                  document.type
                ]
              }
            />

            <DetailItem
              label="File size"
              value={formatFileSize(
                document.fileSize,
              )}
              icon={<HardDrive />}
            />

            <DetailItem
              label="Uploaded"
              value={formatDocumentDate(
                document.createdAt,
              )}
              icon={<CalendarDays />}
            />

            <DetailItem
              label="Last updated"
              value={formatDocumentDate(
                document.updatedAt,
              )}
              icon={<CalendarDays />}
            />
          </div>

          {document.status ===
            "REJECTED" && (
            <>
              <Separator />

              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">
                  Document rejected
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {document.reviewNote ??
                    "No rejection reason was provided."}
                </p>

                {document.reviewedAt && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Reviewed{" "}
                    {formatDocumentDate(
                      document.reviewedAt,
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          {document.status ===
            "VERIFIED" && (
            <>
              <Separator />

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">
                  Document verified
                </p>

                {document.reviewNote && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {document.reviewNote}
                  </p>
                )}

                {document.reviewedAt && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Verified{" "}
                    {formatDocumentDate(
                      document.reviewedAt,
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          {document.status ===
            "PENDING" && (
            <>
              <Separator />

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">
                  Awaiting review
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  This document has not been
                  reviewed by an administrator
                  yet.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function DetailItem({
  label,
  value,
  icon,
}: DetailItemProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="mt-1.5 flex items-center gap-2 text-sm">
        {icon && (
          <span className="[&_svg]:size-4 [&_svg]:text-muted-foreground">
            {icon}
          </span>
        )}

        <span>{value}</span>
      </div>
    </div>
  );
}