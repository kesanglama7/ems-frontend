"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EmployeeRequest } from "../types/employee-request.types";
import { CategoryLabel, EmployeeAvatar, PriorityBadge, RequestStatusBadge, employeeName, requestCode } from "./request-ui";

export function RequestTable({
  requests,
  admin,
  onOpen,
}: {
  requests: EmployeeRequest[];
  admin: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              {admin && <TableHead>Employee</TableHead>}
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-12"><span className="sr-only">Open</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} className="cursor-pointer" onClick={() => onOpen(request.id)}>
                <TableCell>
                  <div className="min-w-56">
                    <p className="font-medium">{request.subject}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{requestCode(request.requestNumber)}</p>
                  </div>
                </TableCell>
                {admin && (
                  <TableCell>
                    <div className="flex min-w-44 items-center gap-2.5">
                      <EmployeeAvatar request={request} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{employeeName(request)}</p>
                        <p className="truncate text-xs text-muted-foreground">{request.employee.employeeCode}</p>
                      </div>
                    </div>
                  </TableCell>
                )}
                <TableCell className="whitespace-nowrap"><CategoryLabel request={request} /></TableCell>
                <TableCell><PriorityBadge priority={request.priority} /></TableCell>
                <TableCell><RequestStatusBadge status={request.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" aria-label="Open request" onClick={(event) => { event.stopPropagation(); onOpen(request.id); }}>
                    <ChevronRight className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
