"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  FileText,
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

import { useVerifyDocument } from "../../hooks/use-verify-document";
import {
  verifyDocumentSchema,
  type VerifyDocumentFormValues,
} from "../../schemas/verify-document.schema";
import type { AdminDocumentListItem } from "../../types/document.types";
import { DocumentStatusBadge } from "../document-status-badge";

interface AdminVerifyDocumentDialogProps {
  document: AdminDocumentListItem | null;
  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;
}

export function AdminVerifyDocumentDialog({
  document,
  open,
  onOpenChange,
}: AdminVerifyDocumentDialogProps) {
  const verifyDocument =
    useVerifyDocument();

  const form =
    useForm<VerifyDocumentFormValues>({
      resolver: zodResolver(
        verifyDocumentSchema,
      ),

      defaultValues: {
        note: "",
      },
    });

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (verifyDocument.isPending) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  }

  async function onSubmit(
    values: VerifyDocumentFormValues,
  ) {
    if (!document) {
      return;
    }

    const note = values.note.trim();

    try {
      await verifyDocument.mutateAsync({
        documentId: document.id,

        input: note
          ? {
              note,
            }
          : {},
      });

      form.reset();
      onOpenChange(false);
    } catch {
      // useVerifyDocument already handles
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
            Verify document
          </DialogTitle>

          <DialogDescription>
            Confirm that this employee document
            has been reviewed and is valid.
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

        <form
          id="verify-document-form"
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
                    Verification note
                    <span className="ml-1 font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {field.value.length}/500
                  </span>
                </div>

                <Textarea
                  {...field}
                  id={field.name}
                  rows={4}
                  maxLength={500}
                  placeholder="Add an optional note about this verification..."
                  aria-invalid={
                    fieldState.invalid
                  }
                  disabled={
                    verifyDocument.isPending
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
              verifyDocument.isPending
            }
            onClick={() =>
              handleOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="verify-document-form"
            disabled={
              verifyDocument.isPending
            }
          >
            <BadgeCheck className="size-4" />

            {verifyDocument.isPending
              ? "Verifying..."
              : "Verify document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}