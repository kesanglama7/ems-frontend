"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { useRejectLeave } from "../../hooks/use-admin-leaves";
import {
  reviewLeaveSchema,
  type ReviewLeaveFormValues,
} from "../../schemas/review-leave.schema";

interface RejectLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveId: string;
  leaveSummary: {
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
  };
}

export function RejectLeaveDialog({
  open,
  onOpenChange,
  leaveId,
  leaveSummary,
}: RejectLeaveDialogProps) {
  const rejectLeave = useRejectLeave();

  const form = useForm<ReviewLeaveFormValues>({
    resolver: zodResolver(reviewLeaveSchema),
    defaultValues: {
      note: "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (rejectLeave.isPending) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  }

  async function onSubmit(values: ReviewLeaveFormValues) {
    const note = values.note.trim();

    try {
      await rejectLeave.mutateAsync({
        leaveId,
        payload: { note: note || undefined },
      });

      form.reset();
      onOpenChange(false);
    } catch {
      // useRejectLeave already handles user-facing API errors.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reject leave request</DialogTitle>
          <DialogDescription>
            Review and reject this employee&apos;s leave request.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="space-y-2">
            <p className="truncate font-medium">{leaveSummary.employeeName}</p>
            <p className="text-sm text-muted-foreground">
              {leaveSummary.leaveType}
            </p>
            <p className="text-sm text-muted-foreground">
              {leaveSummary.startDate} - {leaveSummary.endDate}
            </p>
          </div>
        </div>

        <form
          id="reject-leave-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Controller
            name="note"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between gap-4">
                  <FieldLabel htmlFor={field.name}>
                    Note
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
                  placeholder="Add an optional note about this rejection..."
                  aria-invalid={fieldState.invalid}
                  disabled={rejectLeave.isPending}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={rejectLeave.isPending}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="reject-leave-form"
            variant="destructive"
            disabled={rejectLeave.isPending}
          >
            <X className="size-4" />
            {rejectLeave.isPending ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
