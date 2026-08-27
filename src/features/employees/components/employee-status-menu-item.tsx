"use client";

import {
  CircleCheck,
  CircleX,
} from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getApiErrorMessage } from "@/lib/api-error";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";
import type { UserStatus } from "@/types/user.types";

import { useUpdateEmployeeStatus } from "../hooks/use-update-employee-status";

interface EmployeeStatusMenuItemProps {
  employeeId: string;
  employeeName: string;
  status: UserStatus;
}

export function EmployeeStatusMenuItem({
  employeeId,
  employeeName,
  status,
}: EmployeeStatusMenuItemProps) {
  const confirm =
    useConfirmDialogStore(
      (state) => state.confirm,
    );

  const mutation =
    useUpdateEmployeeStatus();

  const isActive =
    status === "ACTIVE";

  function handleSelect() {
    confirm({
      title: isActive
        ? "Deactivate employee?"
        : "Activate employee?",

      description: isActive
        ? `${employeeName} will no longer have active account access until activated again.`
        : `${employeeName}'s account will be activated.`,

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
                status: isActive
                  ? "INACTIVE"
                  : "ACTIVE",
              },
            });

          toast.success(
            response.message,
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
    <DropdownMenuItem
      disabled={mutation.isPending}
      onClick={handleSelect}
      variant={
        isActive
          ? "destructive"
          : undefined
      }
    >
      {isActive ? (
        <CircleX className="size-4" />
      ) : (
        <CircleCheck className="size-4" />
      )}

      {isActive
        ? "Deactivate"
        : "Activate"}
    </DropdownMenuItem>
  );
}