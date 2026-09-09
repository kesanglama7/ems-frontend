'use client';

import { useState } from "react";
import { useAdjustBalance } from "../../hooks/use-admin-leaves";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import EmployeeSearchSelect from "@/components/shared/admin/employee-search-select";

interface LeaveType {
    id: string;
    name: string;
    hasLimitedBalance: boolean;
}

interface AdjustLeaveBalanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    year: number;
    typeList: LeaveType[];
    employeeId?: string;
    onSuccess?: () => void;
}

export function AdjustLeaveBalanceDialog({
    open,
    onOpenChange,
    year,
    typeList,
    employeeId: initialEmployeeId,
    onSuccess,
}: AdjustLeaveBalanceDialogProps) {
    const adjust = useAdjustBalance();

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(initialEmployeeId ?? "");
    const [leaveTypeId, setLeaveTypeId] = useState<string>("");
    const [adjustment, setAdjustment] = useState<string>("");
    const [adjustReason, setAdjustReason] = useState<string>("");

    const [prevOpen, setPrevOpen] = useState(open);
    const [prevInitialEmployeeId, setPrevInitialEmployeeId] = useState(initialEmployeeId);

    if (open !== prevOpen || initialEmployeeId !== prevInitialEmployeeId) {
        setPrevOpen(open);
        setPrevInitialEmployeeId(initialEmployeeId);

        if (open) {
            setSelectedEmployeeId(initialEmployeeId ?? "");
            setLeaveTypeId("");
            setAdjustment("");
            setAdjustReason("");
        }
    }

    const isEmployeeLocked = Boolean(initialEmployeeId);

    const handleSubmit = async () => {
        if (!selectedEmployeeId || !leaveTypeId || !adjustment || !adjustReason.trim()) {
            return;
        }

        try {
            await adjust.mutateAsync({
                employeeId: selectedEmployeeId,
                leaveTypeId,
                year,
                adjustmentDays: Number(adjustment),
                reason: adjustReason.trim(),
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Failed to adjust balance:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adjust leave balance</DialogTitle>
                    <DialogDescription>
                        Add days with a positive number or remove them with a negative number. Every adjustment is audited.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none flex items-center justify-between">
                            Employee
                            {isEmployeeLocked && (
                                <span className="text-xs text-muted-foreground font-normal">(Locked)</span>
                            )}
                        </label>
                        <EmployeeSearchSelect
                            value={selectedEmployeeId}
                            onChange={setSelectedEmployeeId}
                            disabled={isEmployeeLocked}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Limited leave type</label>
                        <Select
                            value={leaveTypeId}
                            onValueChange={(val) => {
                                if (val) setLeaveTypeId(val);
                            }}
                        >
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeList
                                    .filter((t) => t.hasLimitedBalance)
                                    .map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Adjustment days</label>
                        <Input
                            type="number"
                            step="0.5"
                            value={adjustment}
                            onChange={(e) => setAdjustment(e.target.value)}
                            placeholder="Example: 2 or -1"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Reason</label>
                        <Textarea
                            value={adjustReason}
                            onChange={(e) => setAdjustReason(e.target.value)}
                            placeholder="Reason for adjustment..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={
                            adjust.isPending || 
                            !selectedEmployeeId || 
                            !leaveTypeId || 
                            !adjustment || 
                            !adjustReason.trim()
                        }
                        onClick={handleSubmit}
                    >
                        {adjust.isPending ? "Saving..." : "Save adjustment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}