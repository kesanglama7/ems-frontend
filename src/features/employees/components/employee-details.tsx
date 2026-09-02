"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

import { useEmployee } from "../hooks/use-employee";
import { EmployeeStatusAction } from "./employee-status-action";
import { getInitials } from "@/lib/name-shorten";

interface EmployeeDetailsProps {
  employeeId: string;
}


function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(new Date(value));
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-muted-foreground mt-0.5">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">
          {label}
        </p>

        <div className="mt-1 text-sm font-medium">
          {value}
        </div>
      </div>
    </div>
  );
}

function EmployeeDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />

      <div className="rounded-lg border p-6">
        <div className="flex gap-4">
          <Skeleton className="size-16 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export function EmployeeDetails({
  employeeId,
}: EmployeeDetailsProps) {
  const employeeQuery =
    useEmployee(employeeId);

  if (employeeQuery.isPending) {
    return <EmployeeDetailsSkeleton />;
  }

  if (employeeQuery.isError) {
    return (
      <div className="space-y-6">
        <Link href="/admin/employees" >
        <Button
          variant="ghost"
        >
          <ArrowLeft className="size-4" />
          Employees
        </Button>
        </Link>

        <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <h2 className="font-medium">
            Unable to load employee
          </h2>

          <p className="text-muted-foreground mt-1 max-w-md text-sm">
            {getApiErrorMessage(
              employeeQuery.error,
            )}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() =>
              employeeQuery.refetch()
            }
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const employee =
    employeeQuery.data.data;

  const fullName =
    `${employee.firstName} ${employee.lastName}`;

  return (
    <div className="space-y-6">
      <Link href="/admin/employees" >
      <Button
        variant="ghost"
      >
        <ArrowLeft className="size-4" />
        Employees
      </Button>
      </Link>

      <div className="flex flex-col gap-5 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">
              {getInitials(
                employee.firstName,
                employee.lastName,
              )}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {fullName}
              </h1>

              <Badge
                variant={
                  employee.user.status ===
                  "ACTIVE"
                    ? "default"
                    : "secondary"
                }
              >
                {employee.user.status ===
                "ACTIVE"
                  ? "Active"
                  : "Inactive"}
              </Badge>
            </div>

            <p className="text-muted-foreground mt-1 text-sm">
              {employee.employeeCode}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <EmployeeStatusAction
            employeeId={employee.id}
            employeeName={fullName}
            status={employee.user.status}
          />
          <Link href={`/admin/employees/${employee.id}/edit`}>
          <Button
            variant="outline"
          >
            Edit employee
          </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Personal information
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            <DetailItem
              icon={
                <UserRound className="size-4" />
              }
              label="Full name"
              value={fullName}
            />

            <DetailItem
              icon={
                <Mail className="size-4" />
              }
              label="Email"
              value={
                employee.user.email
              }
            />

            <DetailItem
              icon={
                <Phone className="size-4" />
              }
              label="Phone"
              value={
                employee.phone ?? "—"
              }
            />

            <DetailItem
              icon={
                <CalendarDays className="size-4" />
              }
              label="Joining date"
              value={formatDate(
                employee.dateOfJoining,
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Employment information
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            <DetailItem
              icon={
                <BriefcaseBusiness className="size-4" />
              }
              label="Job title"
              value={
                employee.jobTitle ??
                "—"
              }
            />

            <DetailItem
              icon={
                <Building2 className="size-4" />
              }
              label="Department"
              value={
                employee.department
                  ?.name ??
                "Unassigned"
              }
            />

            <DetailItem
              icon={
                <Building2 className="size-4" />
              }
              label="Department status"
              value={
                employee.department ? (
                  <Badge
                    variant={
                      employee.department
                        .isActive
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {employee.department
                      .isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                ) : (
                  "—"
                )
              }
            />

            <DetailItem
              icon={
                <UserRound className="size-4" />
              }
              label="Employee code"
              value={
                employee.employeeCode
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Account information
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            <DetailItem
              icon={
                <Mail className="size-4" />
              }
              label="Account email"
              value={
                employee.user.email
              }
            />

            <DetailItem
              icon={
                <UserRound className="size-4" />
              }
              label="Role"
              value="Employee"
            />

            <DetailItem
              icon={
                <UserRound className="size-4" />
              }
              label="Account status"
              value={
                <Badge
                  variant={
                    employee.user.status ===
                    "ACTIVE"
                      ? "default"
                      : "secondary"
                  }
                >
                  {employee.user.status ===
                  "ACTIVE"
                    ? "Active"
                    : "Inactive"}
                </Badge>
              }
            />

            <DetailItem
              icon={
                <CalendarDays className="size-4" />
              }
              label="Account created"
              value={formatDate(
                employee.user.createdAt,
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Record information
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            <DetailItem
              icon={
                <CalendarDays className="size-4" />
              }
              label="Created"
              value={formatDate(
                employee.createdAt,
              )}
            />

            <DetailItem
              icon={
                <CalendarDays className="size-4" />
              }
              label="Last updated"
              value={formatDate(
                employee.updatedAt,
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}