"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import {
  Controller,
  useForm,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { useRejectDocument } from "../../hooks/use-reject-document";
import {
  rejectDocumentSchema,
  type RejectDocumentFormValues,
} from "../../schemas/reject-document.schema";
import type { AdminDocumentListItem } from "../../types/document.types";
import { DocumentStatusBadge } from "../document-status-badge";

interface AdminRejectDocumentDialogProps {
  document: AdminDocumentListItem | null;
  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;
}

export function AdminRejectDocumentDialog({
  document,
  open,
  onOpenChange,
}: AdminRejectDocumentDialogProps) {
  const rejectDocument =
    useRejectDocument();

  const form =
    useForm<RejectDocumentFormValues>({
      resolver: zodResolver(
        rejectDocumentSchema,
      ),

      defaultValues: {
        note: "",
      },
    });

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (rejectDocument.isPending) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  }

  async function onSubmit(
    values: RejectDocumentFormValues,
  ) {
    if (!document) {
      return;
    }

    try {
      await rejectDocument.mutateAsync({
        documentId: document.id,

        input: {
          note: values.note.trim(),
        },
      });

      form.reset();
      onOpenChange(false);
    } catch {
      // useRejectDocument already handles
      // user-facing API errors.
    }
  }

  if (!document) {
    return null;
  }

  const employeeName =
    `${document.employee.firstName} ${document.employee.lastName}`.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Reject document
          </DialogTitle>

          <DialogDescription>
            Reject this document and provide a
            reason for the employee.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
              <FileText className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="truncate font-medium"
                title={document.title}
              >
                {document.title}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {employeeName}
              </p>

              <p
                className="mt-0.5 truncate text-xs text-muted-foreground"
                title={
                  document.originalFileName
                }
              >
                {
                  document.originalFileName
                }
              </p>
            </div>

            <DocumentStatusBadge
              status={document.status}
            />
          </div>
        </div>

        <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />

          <div>
            <p className="text-sm font-medium">
              The employee will see the rejection
              reason.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Clearly explain what needs to be
              corrected before the document is
              uploaded again.
            </p>
          </div>
        </div>

        <form
          id="reject-document-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(
            onSubmit,
          )}
        >
          <Controller
            name="note"
            control={form.control}
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <FieldLabel
                    htmlFor={field.name}
                  >
                    Rejection reason
                  </FieldLabel>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {field.value.length}/500
                  </span>
                </div>

                <Textarea
                  {...field}
                  id={field.name}
                  rows={5}
                  maxLength={500}
                  placeholder="Explain why this document is being rejected..."
                  aria-invalid={
                    fieldState.invalid
                  }
                  disabled={
                    rejectDocument.isPending
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={
              rejectDocument.isPending
            }
            onClick={() =>
              handleOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="reject-document-form"
            variant="destructive"
            disabled={
              rejectDocument.isPending
            }
          >
            <XCircle className="size-4" />

            {rejectDocument.isPending
              ? "Rejecting..."
              : "Reject document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}