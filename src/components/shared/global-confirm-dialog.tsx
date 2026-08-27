"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";

export function GlobalConfirmDialog() {
  const open = useConfirmDialogStore(
    (state) => state.open,
  );

  const options = useConfirmDialogStore(
    (state) => state.options,
  );

  const close = useConfirmDialogStore(
    (state) => state.close,
  );

  const [isPending, setIsPending] =
    useState(false);

  const handleOpenChange = (
    nextOpen: boolean,
  ) => {
    if (!nextOpen && !isPending) {
      close();
    }
  };

  const handleConfirm = async () => {
    if (!options || isPending) {
      return;
    }

    setIsPending(true);

    try {
      await options.onConfirm();
      close();
    } catch {
      // Feature mutations already handle user-facing errors.
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {options?.title}
          </DialogTitle>

          <DialogDescription>
            {options?.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={close}
          >
            {options?.cancelLabel ?? "Cancel"}
          </Button>

          <Button
            type="button"
            variant={
              options?.destructive
                ? "destructive"
                : "default"
            }
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending
              ? "Please wait..."
              : options?.confirmLabel ??
                "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
