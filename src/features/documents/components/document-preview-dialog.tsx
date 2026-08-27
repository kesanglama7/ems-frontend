"use client";

import {
  AlertCircle,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api-error";

import type {
  DocumentFile,
  EmployeeDocument,
} from "../types/document.types";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  document: EmployeeDocument | null;
  file: DocumentFile | undefined;

  isLoading: boolean;
  error: Error | null;

  onRetry: () => void;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
  file,
  isLoading,
  error,
  onRetry,
}: DocumentPreviewDialogProps) {
  const isPdf =
    file?.mimeType === "application/pdf";

  const isImage =
    file?.mimeType === "image/jpeg" ||
    file?.mimeType === "image/png";

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="flex h-[85vh] max-h-[900px] flex-col sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {document?.title ?? "Document preview"}
          </DialogTitle>

          <DialogDescription>
            {file?.originalFileName ??
              document?.originalFileName}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-muted/20">
          {isLoading && (
            <div className="flex h-full min-h-96 flex-col items-center justify-center gap-3">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />

              <p className="text-sm text-muted-foreground">
                Loading document...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex h-full min-h-96 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-5 text-destructive" />
              </div>

              <h3 className="font-semibold">
                Unable to preview document
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {getApiErrorMessage(error)}
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={onRetry}
              >
                <RefreshCw />
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && file && isPdf && (
            <iframe
              src={file.url}
              title={
                document?.title ??
                file.originalFileName
              }
              className="h-full min-h-96 w-full border-0"
            />
          )}

          {!isLoading &&
            !error &&
            file &&
            isImage && (
              <div className="flex h-full min-h-96 items-center justify-center overflow-auto p-4">
                {/* Signed runtime URL is not suitable for next/image remote configuration. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={
                    document?.title ??
                    file.originalFileName
                  }
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

          {!isLoading &&
            !error &&
            file &&
            !isPdf &&
            !isImage && (
              <div className="flex h-full min-h-96 flex-col items-center justify-center px-6 text-center">
                <FileText className="mb-3 size-8 text-muted-foreground" />

                <h3 className="font-medium">
                  Preview unavailable
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  This file type cannot be previewed
                  inside the application.
                </p>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}