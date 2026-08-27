"use client";

import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  FileText,
  HardDrive,
  Mail,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

import { useAdminDocument } from "../../hooks/use-admin-document";
import {
  DOCUMENT_TYPE_LABELS,
  formatFileSize,
} from "../../utils/document.utils";

import { DocumentStatusBadge } from "../document-status-badge";

interface AdminDocumentDetailsDialogProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminDocumentDetailsDialog({
  documentId,
  open,
  onOpenChange,
}: AdminDocumentDetailsDialogProps) {
  const {
    data: document,
    error,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useAdminDocument(
    open ? documentId ?? undefined : undefined,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Document details
          </DialogTitle>

          <DialogDescription>
            Review the employee and document
            information.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <AdminDocumentDetailsSkeleton />
        )}

        {isError && (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-5 text-destructive" />
            </div>

            <h3 className="font-semibold">
              Unable to load document
            </h3>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {getApiErrorMessage(error)}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              disabled={isFetching}
              onClick={() => {
                void refetch();
              }}
            >
              <RefreshCw
                className={
                  isFetching
                    ? "size-4 animate-spin"
                    : "size-4"
                }
              />

              Try again
            </Button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          document && (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                  <FileText className="size-5 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className="truncate font-medium"
                    title={document.title}
                  >
                    {document.title}
                  </h3>

                  <p
                    className="mt-1 truncate text-sm text-muted-foreground"
                    title={
                      document.originalFileName
                    }
                  >
                    {document.originalFileName}
                  </p>
                </div>

                <DocumentStatusBadge
                  status={document.status}
                />
              </div>

              <Separator />

              <section className="space-y-4">
                <SectionTitle>
                  Document information
                </SectionTitle>

                <div className="grid gap-5 sm:grid-cols-2">
                  <DetailItem
                    icon={<FileText />}
                    label="Document type"
                    value={
                      DOCUMENT_TYPE_LABELS[
                        document.type
                      ]
                    }
                  />

                  <DetailItem
                    icon={<HardDrive />}
                    label="File size"
                    value={formatFileSize(
                      document.fileSize,
                    )}
                  />

                  <DetailItem
                    icon={<FileText />}
                    label="File name"
                    value={
                      document.originalFileName
                    }
                  />

                  <DetailItem
                    icon={<FileText />}
                    label="File type"
                    value={document.mimeType}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <SectionTitle>
                  Employee information
                </SectionTitle>

                <div className="grid gap-5 sm:grid-cols-2">
                  <DetailItem
                    icon={<User />}
                    label="Employee"
                    value={`${document.employee.firstName} ${document.employee.lastName}`}
                  />

                  <DetailItem
                    icon={<BadgeCheck />}
                    label="Employee code"
                    value={
                      document.employee
                        .employeeCode
                    }
                  />

                  <DetailItem
                    icon={
                      <BriefcaseBusiness />
                    }
                    label="Job title"
                    value={
                      document.employee.jobTitle
                    }
                  />

                  <DetailItem
                    icon={<Building2 />}
                    label="Department"
                    value={
                      document.employee
                        .department.name
                    }
                  />

                  <DetailItem
                    icon={<Mail />}
                    label="Email"
                    value={
                      document.employee.user
                        .email
                    }
                  />

                  <DetailItem
                    icon={<Phone />}
                    label="Phone"
                    value={
                      document.employee.phone
                    }
                  />

                  <DetailItem
                    icon={<User />}
                    label="Account status"
                    value={
                      document.employee.user
                        .status
                    }
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <SectionTitle>
                  Review information
                </SectionTitle>

                {document.status ===
                  "PENDING" && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="font-medium">
                      Awaiting review
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      This document has not yet
                      been reviewed.
                    </p>
                  </div>
                )}

                {document.status ===
                  "VERIFIED" && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="font-medium">
                      Document verified
                    </p>

                    {document.reviewNote && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        {document.reviewNote}
                      </p>
                    )}

                    {document.reviewedAt && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Reviewed{" "}
                        {formatReviewDate(
                          document.reviewedAt,
                        )}
                      </p>
                    )}
                  </div>
                )}

                {document.status ===
                  "REJECTED" && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <p className="font-medium text-destructive">
                      Document rejected
                    </p>

                    {document.reviewNote ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        {document.reviewNote}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        No rejection reason was
                        provided.
                      </p>
                    )}

                    {document.reviewedAt && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Reviewed{" "}
                        {formatReviewDate(
                          document.reviewedAt,
                        )}
                      </p>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}

interface SectionTitleProps {
  children: React.ReactNode;
}

function SectionTitle({
  children,
}: SectionTitleProps) {
  return (
    <h4 className="text-sm font-semibold">
      {children}
    </h4>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({
  icon,
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="mt-1.5 flex items-start gap-2 text-sm">
        <span className="mt-0.5 shrink-0 [&_svg]:size-4 [&_svg]:text-muted-foreground">
          {icon}
        </span>

        <span className="min-w-0 break-words">
          {value}
        </span>
      </div>
    </div>
  );
}

function formatReviewDate(
  value: string,
) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function AdminDocumentDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Skeleton className="size-11 rounded-lg" />

        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-52" />
        </div>

        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <Separator />

      <div className="space-y-4">
        <Skeleton className="h-4 w-36" />

        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="space-y-2"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Skeleton className="h-4 w-36" />

        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="space-y-2"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}