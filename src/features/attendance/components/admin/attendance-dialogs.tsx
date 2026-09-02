"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Plus,
  Search,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
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
import { Portal } from "@/components/ui/portal";
import { Textarea } from "@/components/ui/textarea";

import { useEmployeesInfinite } from "@/features/employees/hooks/use-employees-infinite";
import { getInitials } from "@/lib/name-shorten";

import {
  useCreateAdminAttendance,
  useUpdateAdminAttendance,
} from "../../hooks/use-attendance";
import {
  correctAttendanceSchema,
  createAttendanceSchema,
  type CorrectAttendanceFormValues,
  type CreateAttendanceFormValues,
} from "../../schemas/attendance.schema";

// ─────────────────────────────────────────────────────────────
// Employee Search Select
// ─────────────────────────────────────────────────────────────

interface EmployeeSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function EmployeeSearchSelect({
  value,
  onChange,
  disabled,
}: EmployeeSearchSelectProps) {
  const [search, setSearch] =
    useState("");

  const [isOpen, setIsOpen] =
    useState(false);

  const [dropdownRect, setDropdownRect] =
    useState<DOMRect | null>(null);

  const triggerRef =
    useRef<HTMLButtonElement>(null);

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const {
    data: pages,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEmployeesInfinite({
    search: search || undefined,
    limit: 20,
  });

  const allEmployees = useMemo(
    () =>
      pages?.pages.flatMap(
        (page) => page.data,
      ) ?? [],
    [pages],
  );

  const selectedEmployee = useMemo(
    () =>
      allEmployees.find(
        (employee) =>
          employee.id === value,
      ),
    [allEmployees, value],
  );

  function handleTriggerClick() {
    if (disabled) {
      return;
    }

    if (isOpen) {
      setIsOpen(false);
      setSearch("");
      return;
    }

    if (triggerRef.current) {
      setDropdownRect(
        triggerRef.current.getBoundingClientRect(),
      );
    }

    setIsOpen(true);
  }

  const handleScroll = useMemo(
    () => () => {
      if (!scrollRef.current) {
        return;
      }

      const {
        scrollTop,
        scrollHeight,
        clientHeight,
      } = scrollRef.current;

      const isNearBottom =
        scrollHeight - scrollTop <=
        clientHeight + 50;

      if (
        isNearBottom &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        void fetchNextPage();
      }
    },
    [
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    ],
  );

  function handleSelectEmployee(
    employeeId: string,
  ) {
    onChange(employeeId);
    setIsOpen(false);
    setSearch("");
  }

  function handleClear() {
    onChange("");
    setSearch("");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        disabled={disabled}
        className="flex h-9 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selectedEmployee ? (
          <div className="flex items-center gap-2 truncate">
            <Avatar className="size-5">
              <AvatarFallback className="text-xs">
                {getInitials(
                  selectedEmployee.firstName,
                  selectedEmployee.lastName,
                )}
              </AvatarFallback>
            </Avatar>

            <span className="truncate">
              {selectedEmployee.firstName}{" "}
              {selectedEmployee.lastName}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">
            Select employee
          </span>
        )}

        <svg
          className="size-4 shrink-0 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && dropdownRect && (
        <Portal>
          <div
            className="fixed z-50 mt-1 w-72 rounded-md border bg-popover text-popover-foreground shadow-md"
            style={{
              left: dropdownRect.left,
              top:
                dropdownRect.bottom + 4,
              width:
                dropdownRect.width,
            }}
          >
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Search className="size-4 shrink-0 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />

              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="max-h-60 overflow-y-auto p-1"
            >
              <button
                type="button"
                onClick={() =>
                  handleSelectEmployee("")
                }
                className={`flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                  !value
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                All employees
              </button>

              {isPending ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : allEmployees.length ===
                0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No employees found
                </div>
              ) : (
                allEmployees.map(
                  (employee) => (
                    <button
                      key={
                        employee.id
                      }
                      type="button"
                      onClick={() =>
                        handleSelectEmployee(
                          employee.id,
                        )
                      }
                      className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                        value ===
                        employee.id
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      <Avatar className="size-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(
                            employee.firstName,
                            employee.lastName,
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <span className="truncate">
                        {
                          employee.firstName
                        }{" "}
                        {
                          employee.lastName
                        }
                      </span>
                    </button>
                  ),
                )
              )}

              {isFetchingNextPage && (
                <div className="px-2 py-1.5 text-center text-sm text-muted-foreground">
                  Loading more...
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Create Attendance Dialog
// ─────────────────────────────────────────────────────────────

interface CreateAttendanceDialogProps {
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
  onSuccess: () => void;
}

export function CreateAttendanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAttendanceDialogProps) {
  const createMutation =
    useCreateAdminAttendance();

  const form =
    useForm<CreateAttendanceFormValues>(
      {
        resolver: zodResolver(
          createAttendanceSchema,
        ),
        defaultValues: {
          employeeId: "",
          checkInAt: "",
          checkOutAt: "",
          reason: "",
        },
      },
    );

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (
      createMutation.isPending
    ) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  }

  async function onSubmit(
    values: CreateAttendanceFormValues,
  ) {
    try {
      await createMutation.mutateAsync(
        {
          employeeId:
            values.employeeId,

          checkInAt: new Date(
            values.checkInAt,
          ).toISOString(),

          checkOutAt:
            values.checkOutAt
              ? new Date(
                  values.checkOutAt,
                ).toISOString()
              : undefined,

          reason: values.reason,
        },
      );

      form.reset();

      onOpenChange(false);

      onSuccess();
    } catch {
      // Mutation already handles toast errors.
    }
  }

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
            Create Manual Attendance
          </DialogTitle>

          <DialogDescription>
            Add an attendance record
            manually for an employee.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-attendance-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(
            onSubmit,
          )}
        >
          <Controller
            name="employeeId"
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
                <FieldLabel>
                  Employee
                </FieldLabel>

                <EmployeeSearchSelect
                  value={
                    field.value
                  }
                  onChange={
                    field.onChange
                  }
                  disabled={
                    createMutation.isPending
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
            name="checkInAt"
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
                <FieldLabel>
                  Check-in Time
                </FieldLabel>

                <Input
                  type="datetime-local"
                  {...field}
                  disabled={
                    createMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value,
                    )
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
            name="checkOutAt"
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
                <FieldLabel>
                  Check-out Time{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>

                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value || ""
                  }
                  disabled={
                    createMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value ||
                        undefined,
                    )
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
            name="reason"
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
                <FieldLabel>
                  Reason
                </FieldLabel>

                <Textarea
                  {...field}
                  rows={3}
                  maxLength={500}
                  placeholder="Why is this attendance being created manually?"
                  disabled={
                    createMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value,
                    )
                  }
                />

                <div className="text-right text-xs text-muted-foreground">
                  {
                    field.value
                      .length
                  }
                  /500
                </div>

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
              createMutation.isPending
            }
            onClick={() =>
              handleOpenChange(
                false,
              )
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="create-attendance-form"
            disabled={
              createMutation.isPending
            }
          >
            <Plus className="size-4" />

            {createMutation.isPending
              ? "Creating..."
              : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Correct Attendance Dialog
// ─────────────────────────────────────────────────────────────

interface CorrectAttendanceDialogProps {
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
  attendanceId: string;
  defaultCheckInAt?: string;
  defaultCheckOutAt?: string;
  onSuccess: () => void;
}

export function CorrectAttendanceDialog({
  open,
  onOpenChange,
  attendanceId,
  defaultCheckInAt,
  defaultCheckOutAt,
  onSuccess,
}: CorrectAttendanceDialogProps) {
  const updateMutation =
    useUpdateAdminAttendance();

  const defaultCheckInLocal =
    defaultCheckInAt
      ? new Date(
          defaultCheckInAt,
        )
          .toISOString()
          .slice(0, 16)
      : "";

  const defaultCheckOutLocal =
    defaultCheckOutAt
      ? new Date(
          defaultCheckOutAt,
        )
          .toISOString()
          .slice(0, 16)
      : "";

  const form =
    useForm<CorrectAttendanceFormValues>(
      {
        resolver: zodResolver(
          correctAttendanceSchema,
        ),
        defaultValues: {
          checkInAt:
            defaultCheckInLocal,
          checkOutAt:
            defaultCheckOutLocal,
          reason: "",
        },
      },
    );

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (
      updateMutation.isPending
    ) {
      return;
    }

    /*
     * Populate the form whenever the
     * dialog is opened.
     *
     * This avoids mutating an object
     * created using useMemo.
     */
    if (nextOpen) {
      form.reset({
        checkInAt:
          defaultCheckInLocal,
        checkOutAt:
          defaultCheckOutLocal,
        reason: "",
      });
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  }

  async function onSubmit(
    values: CorrectAttendanceFormValues,
  ) {
    try {
      await updateMutation.mutateAsync(
        {
          attendanceId,

          payload: {
            checkInAt:
              values.checkInAt
                ? new Date(
                    values.checkInAt,
                  ).toISOString()
                : undefined,

            checkOutAt:
              values.checkOutAt
                ? new Date(
                    values.checkOutAt,
                  ).toISOString()
                : undefined,

            reason:
              values.reason,
          },
        },
      );

      form.reset();

      onOpenChange(false);

      onSuccess();
    } catch {
      // Mutation already handles toast errors.
    }
  }

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
            Correct Attendance
          </DialogTitle>

          <DialogDescription>
            Fix check-in or check-out
            times for this attendance
            record.
          </DialogDescription>
        </DialogHeader>

        <form
          id="correct-attendance-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(
            onSubmit,
          )}
        >
          <Controller
            name="checkInAt"
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
                <FieldLabel>
                  Check-in Time
                </FieldLabel>

                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value || ""
                  }
                  disabled={
                    updateMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value ||
                        undefined,
                    )
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
            name="checkOutAt"
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
                <FieldLabel>
                  Check-out Time{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>

                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value || ""
                  }
                  disabled={
                    updateMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value ||
                        undefined,
                    )
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
            name="reason"
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
                <FieldLabel>
                  Reason
                </FieldLabel>

                <Textarea
                  {...field}
                  rows={3}
                  maxLength={500}
                  placeholder="Why is this correction being made?"
                  disabled={
                    updateMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value,
                    )
                  }
                />

                <div className="text-right text-xs text-muted-foreground">
                  {
                    field.value
                      .length
                  }
                  /500
                </div>

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
              updateMutation.isPending
            }
            onClick={() =>
              handleOpenChange(
                false,
              )
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="correct-attendance-form"
            disabled={
              updateMutation.isPending
            }
          >
            <Pencil className="size-4" />

            {updateMutation.isPending
              ? "Saving..."
              : "Save Correction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}