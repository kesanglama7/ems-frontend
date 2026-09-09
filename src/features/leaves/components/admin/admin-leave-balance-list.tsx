'use client';

import { useState } from "react";
import { useAdminBalances } from "../../hooks/use-admin-leaves";

import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLeaveBalanceList() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState<number>(currentYear);
    const balances = useAdminBalances(year);

    const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

    return (
        <section className="flex flex-1 flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Employee Balances</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage and view leave balances for the year {year}.
                    </p>
                </div>
                <Select 
                    value={year.toString()} 
                    onValueChange={(val) => setYear(parseInt(val ?? String(new Date().getFullYear()), 10))}
                >
                    <SelectTrigger className="w-[140px] bg-background">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[250px]">Employee</TableHead>
                            <TableHead className="w-[200px]">Department</TableHead>
                            <TableHead>Leave Balances</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Loading State */}
                        {balances.isLoading && (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-full max-w-[400px]" /></TableCell>
                                </TableRow>
                            ))
                        )}

                        {/* Empty State */}
                        {!balances.isLoading && balances.data?.data.employees.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No employee records found for {year}.
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Data State */}
                        {!balances.isLoading && balances.data?.data.employees.map((emp) => (
                            <TableRow key={emp.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">
                                            {emp.firstName} {emp.lastName}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-0.5">
                                            {emp.employeeCode}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {emp.department?.name ?? "—"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        {emp.balances.length > 0 ? emp.balances.map((b) => (
                                            <Badge 
                                                key={b.leaveTypeId} 
                                                variant="secondary"
                                                className="font-normal border-muted-foreground/20"
                                            >
                                                <span className="font-medium mr-1 text-foreground">
                                                    {b.name}:
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {b.limited
                                                        ? `${b.remainingDays} left (Used: ${b.usedDays})`
                                                        : "Unlimited"
                                                    }
                                                </span>
                                            </Badge>
                                        )) : (
                                            <span className="text-xs text-muted-foreground italic">No leave types assigned</span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}