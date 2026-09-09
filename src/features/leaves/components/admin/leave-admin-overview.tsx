"use client";

import { useState } from "react";
import {
    Plus,
    CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getTodayDate } from "@/lib/general";
import { useLeaveTypes } from "../../hooks/use-leave-types";
import {
    useAdminLeaveSummary,
    useCreateAdminLeave,
} from "../../hooks/use-admin-leaves";
import type { LeaveDuration } from "../../types/leave.types";
import EmployeeSearchSelect from "@/components/shared/admin/employee-search-select";

interface FormState {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    duration: LeaveDuration;
    reason: string;
}

const INITIAL_FORM_STATE: FormState = {
    employeeId: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    duration: "FULL_DAY",
    reason: "",
};

const selectClass =
    "h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function LeaveAdminOverview() {
    const [year] = useState(new Date().getFullYear());
    const [createOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE);

    const summary = useAdminLeaveSummary(year);
    const types = useLeaveTypes();
    const create = useCreateAdminLeave();

    const stats = summary.data?.data;
    const typeList = types.data?.data.filter((t) => t.isActive) ?? [];

    const handleFieldChange = <K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE);
    };

    const handleOpenChange = (open: boolean) => {
        setCreateOpen(open);
        if (!open) resetForm();
    };

    const isFormValid =
        Boolean(formData.employeeId) &&
        Boolean(formData.leaveTypeId) &&
        Boolean(formData.startDate) &&
        Boolean(formData.endDate) &&
        Boolean(formData.reason.trim());

    const submitCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || create.isPending) return;

        try {
            await create.mutateAsync(formData);
            handleOpenChange(false);
        } catch (error) {
            console.error("Failed to create leave:", error);
        }
    };

    const summaryCards: {
        label: string;
        value: number | undefined;
    }[] = [
        {
            label: "Pending Requests",
            value: stats?.pendingRequests
        },
        {
            label: "Approved This Month",
            value: stats?.approvedThisMonth
        },
        {
            label: "On Leave Today",
            value: stats?.employeesOnLeaveToday
        },
        {
            label: "Auto Rejected",
            value: stats?.autoRejectedThisMonth
        },
    ];

    return (
        <section className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Leave Overview
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            <CalendarDays className="size-3" />
                            {year}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Balances reset each calendar year. Prior years remain in history.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="self-start sm:self-auto shadow-sm">
                    <Plus className="mr-1.5 size-4" />
                    Create Leave
                </Button>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map(({ label, value}) => (
                    <Card key={label} className="shadow-xs transition-all hover:shadow-md py-4">
                        <CardContent>
                            {summary.isLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="flex items-center flex-col gap-2">
                                    <h1 className="text-2xl font-bold">{value ?? "0"}</h1>
                                    <span className="text-sm text-muted-foreground">
                                        {label}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create Leave Dialog */}
            <Dialog open={createOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={submitCreate}>
                        <DialogHeader>
                            <DialogTitle>Create Employee Leave</DialogTitle>
                            <DialogDescription>
                                Directly issue an approved leave for an employee.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <FieldGroup className="-space-y-3">
                                {/* Employee & Leave Type Row */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel>
                                            Employee <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <EmployeeSearchSelect
                                            value={formData.employeeId}
                                            onChange={(employeeId) =>
                                                handleFieldChange("employeeId", employeeId)
                                            }
                                            disabled={false}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel>
                                            Leave Type <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <select
                                            className={selectClass}
                                            value={formData.leaveTypeId}
                                            onChange={(e) =>
                                                handleFieldChange("leaveTypeId", e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">Select type</option>
                                            {typeList.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                    {t.isSystem ? " (Emergency)" : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                {/* Start & End Date Row */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel>
                                            Start Date <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            type="date"
                                            min={getTodayDate()}
                                            value={formData.startDate}
                                            onChange={(e) =>
                                                handleFieldChange("startDate", e.target.value)
                                            }
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>
                                            End Date <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            type="date"
                                            min={formData.startDate || getTodayDate()}
                                            value={formData.endDate}
                                            onChange={(e) =>
                                                handleFieldChange("endDate", e.target.value)
                                            }
                                            required
                                        />
                                    </Field>
                                </div>

                                {/* Duration Select */}
                                <Field>
                                    <FieldLabel>Duration</FieldLabel>
                                    <select
                                        className={selectClass}
                                        value={formData.duration}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "duration",
                                                e.target.value as LeaveDuration
                                            )
                                        }
                                    >
                                        <option value="FULL_DAY">Full Day</option>
                                        <option value="FIRST_HALF">First Half</option>
                                        <option value="SECOND_HALF">Second Half</option>
                                    </select>
                                </Field>

                                {/* Reason Textarea */}
                                <Field>
                                    <FieldLabel>
                                        Reason <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        rows={3}
                                        placeholder="Provide a reason for the leave request..."
                                        value={formData.reason}
                                        onChange={(e) =>
                                            handleFieldChange("reason", e.target.value)
                                        }
                                        required
                                    />
                                </Field>
                            </FieldGroup>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isFormValid || create.isPending}
                            >
                                {create.isPending ? "Creating..." : "Create Approved Leave"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}