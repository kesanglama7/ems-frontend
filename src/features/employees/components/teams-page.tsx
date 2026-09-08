"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/features/departments/hooks/use-departments";
import { useColleagues } from "@/features/employees/hooks/use-colleagues";
import type { TeamMember } from "@/features/employees/types/employee.types";
import { getInitials } from "@/lib/name-shorten";

const ALL_DEPARTMENTS = "ALL";
const UNASSIGNED_DEPARTMENT = "unassigned";

export default function Teams() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState(ALL_DEPARTMENTS);
  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading, isError } = useColleagues({
    page: 1,
    limit: 100,
    ...(deferredSearch && { search: deferredSearch }),
    ...(departmentFilter !== ALL_DEPARTMENTS && {
      departmentId: departmentFilter,
    }),
  });
  const departmentsQuery = useDepartments();

  const teamMembers = data?.data ?? [];

  const departmentItems = useMemo(
    () => [
      {
        label: "All departments",
        value: ALL_DEPARTMENTS,
      },
      ...(departmentsQuery.data?.data ?? []).map((department) => ({
        label: department.isActive
          ? department.name
          : `${department.name} (Inactive)`,
        value: department.id,
      })),
    ],
    [departmentsQuery.data],
  );

  const groupedMembers = useMemo(() => {
    const groups = new Map<
      string,
      { name: string; members: TeamMember[] }
    >();

    teamMembers.forEach((member) => {
      const key = member.department?.id ?? UNASSIGNED_DEPARTMENT;
      const name = member.department?.name ?? "No department";
      const group = groups.get(key);

      if (group) {
        group.members.push(member);
      } else {
        groups.set(key, { name, members: [member] });
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [teamMembers]);

  const hasFilters =
    search.length > 0 ||
    departmentFilter !== ALL_DEPARTMENTS;

  function clearFilters() {
    setSearch("");
    setDepartmentFilter(ALL_DEPARTMENTS);
  }

  return (
    <main className="flex flex-1 flex-col gap-6">
      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Team Members
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse employees across all departments
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search team members"
            className="sm:flex-1"
          />

          <Select
            items={departmentItems}
            value={departmentFilter}
            onValueChange={(value) => {
              if (!value) {
                return;
              }

              setDepartmentFilter(value);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-56"
              disabled={departmentsQuery.isPending}
              aria-label="Filter by department"
            >
              <SelectValue placeholder="Department" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {departmentItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            Clear
          </Button>
        </div>

      </div>

      <div className="px-4">
        <div className=" space-y-8">
          {isLoading ? (
            <TeamMembersSkeleton />
          ) : isError ? (
            <EmptyState message="Unable to load team members." />
          ) : groupedMembers.length > 0 ? (
            groupedMembers.map((group) => (
              <section key={group.name}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="font-semibold">{group.name}</h2>
                  <span className="text-sm text-muted-foreground">
                    ({group.members.length})
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.members.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <EmptyState
              message={
                hasFilters
                  ? "No team members match these filters."
                  : "No team members found."
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const fullName = `${member.firstName} ${member.lastName}`;

  return (
    <Card>
      <CardContent className="flex flex-row items-center gap-4">
        <Avatar className="size-16 shrink-0">
          <AvatarImage
            src={member.profileImageUrl ?? undefined}
            alt={fullName}
          />
          <AvatarFallback className="text-base">
            {getInitials(member.firstName, member.lastName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{fullName}</p>
          <p className="truncate text-sm text-muted-foreground">
            {member.email}
          </p>
          {member.jobTitle && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {member.jobTitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 rounded-xl border p-4"
          >
            <div className="size-16 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
