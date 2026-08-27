"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Input } from "@/components/ui/input";

import { useChangePassword } from "../hooks/use-change-password";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas/change-password.schema";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const changePasswordMutation =
    useChangePassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleDialogChange = (
    nextOpen: boolean,
  ) => {
    if (!nextOpen) {
      form.reset();
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = (
    values: ChangePasswordFormValues,
  ) => {
    changePasswordMutation.mutate(
      {
        currentPassword:
          values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Change password
          </DialogTitle>

          <DialogDescription>
            Enter your current password and choose
            a new password for your account.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <Controller
            name="currentPassword"
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
                <FieldLabel
                  htmlFor={field.name}
                >
                  Current password
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={
                    fieldState.invalid
                  }
                  disabled={
                    changePasswordMutation.isPending
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

          <Controller
            name="newPassword"
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
                <FieldLabel
                  htmlFor={field.name}
                >
                  New password
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={
                    fieldState.invalid
                  }
                  disabled={
                    changePasswordMutation.isPending
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

          <Controller
            name="confirmPassword"
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
                <FieldLabel
                  htmlFor={field.name}
                >
                  Confirm new password
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={
                    fieldState.invalid
                  }
                  disabled={
                    changePasswordMutation.isPending
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleDialogChange(false)
              }
              disabled={
                changePasswordMutation.isPending
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                changePasswordMutation.isPending
              }
            >
              {changePasswordMutation.isPending
                ? "Changing..."
                : "Change password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
