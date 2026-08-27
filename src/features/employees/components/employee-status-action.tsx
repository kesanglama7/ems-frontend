"use client";

import {
  CircleCheck,
  CircleX,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";
import type { UserStatus } from "@/types/user.types";

import { useUpdateEmployeeStatus } from "../hooks/use-update-employee-status";

interface EmployeeStatusActionProps {
  employeeId: string;
  employeeName: string;
  status: UserStatus;
  variant?: "button" | "menu";
}

export function EmployeeStatusAction({
  employeeId,
  employeeName,
  status,
}: EmployeeStatusActionProps) {
  const confirm = useConfirmDialogStore(
    (state) => state.confirm,
  );

  const mutation =
    useUpdateEmployeeStatus();

  const isActive =
    status === "ACTIVE";

  const nextStatus: UserStatus =
    isActive
      ? "INACTIVE"
      : "ACTIVE";

  function handleStatusChange() {
    confirm({
      title: isActive
        ? "Deactivate employee?"
        : "Activate employee?",

      description: isActive
        ? `${employeeName} will no longer have active account access until the employee is activated again.`
        : `${employeeName}'s account will be activated and account access will be restored.`,

      confirmLabel: isActive
        ? "Deactivate"
        : "Activate",

      destructive: isActive,

      onConfirm: async () => {
        try {
          const response =
            await mutation.mutateAsync({
              employeeId,
              payload: {
                status:
                  nextStatus,
              },
            });

          toast.success(
            response.message ||
              `Employee ${
                isActive
                  ? "deactivated"
                  : "activated"
              } successfully.`,
          );
        } catch (error) {
          toast.error(
            getApiErrorMessage(
              error,
            ),
          );

          throw error;
        }
      },
    });
  }

  return (
    <Button
      type="button"
      variant={
        isActive
          ? "outline"
          : "default"
      }
      disabled={
        mutation.isPending
      }
      onClick={
        handleStatusChange
      }
    >
      {mutation.isPending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : isActive ? (
        <CircleX className="size-4" />
      ) : (
        <CircleCheck className="size-4" />
      )}

      {mutation.isPending
        ? "Updating..."
        : isActive
          ? "Deactivate"
          : "Activate"}
    </Button>
  );
}