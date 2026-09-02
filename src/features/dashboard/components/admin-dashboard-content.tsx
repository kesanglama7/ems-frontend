"use client";

import { StatCard } from "./stat-card";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { useDashboardSummary } from "../hooks/use-dashboard";
import { Users, Building2, CalendarCheck, Clock, AlertCircle, FileText, UserMinus, Clock4 } from "lucide-react";

export function AdminDashboardContent() {
  const { data: summary, isLoading, isError, error } = useDashboardSummary();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-destructive/5">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <p className="text-lg font-medium text-destructive">Failed to load dashboard</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {error?.message || "We encountered an error while fetching your dashboard data. Please try refreshing."}
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Admin Overview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your organization, track attendance, and review pending requests.
        </p>
      </div>

      {((summary?.pendingLeaveRequests ?? 0) > 0 || (summary?.pendingDocuments ?? 0) > 0) && (
        <section className="space-y-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 p-6 border border-amber-100 dark:border-amber-900/50">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-500">
            <AlertCircle className="h-5 w-5" /> Requires Attention
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Pending Leaves"
              value={summary?.pendingLeaveRequests ?? 0}
              description="Awaiting approval"
              variant="warning"
              href="/admin/leaves/requests"
              icon={<CalendarCheck className="size-6" />}
            />
            <StatCard
              title="Pending Documents"
              value={summary?.pendingDocuments ?? 0}
              description="Needs verification"
              variant="warning"
              href="/admin/documents"
              icon={<FileText className="size-6" />}
            />
          </div>
        </section>
      )}

      {/* SECTION 2: Today's Attendance */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Today&apos;s Attendance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Checked In"
            value={summary?.checkedInToday ?? 0}
            href="/admin/attendance"
            icon={<Clock className="size-6" />}
          />
          <StatCard
            title="Currently Working"
            value={summary?.currentlyWorking ?? 0}
            variant="success"
            href="/admin/attendance"
            icon={<Clock4 className="size-6" />}
          />
          <StatCard
            title="Checked Out"
            value={summary?.checkedOutToday ?? 0}
            href="/admin/attendance"
            icon={<UserMinus className="size-6" />}
          />
          <StatCard
            title="Late Arrivals"
            value={summary?.lateToday ?? 0}
            variant="destructive"
            href="/admin/attendance"
            icon={<AlertCircle className="size-6" />}
          />
        </div>
      </section>

      {/* SECTION 3: Organization Overview */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Organization</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={summary?.totalEmployees ?? 0}
            href="/admin/employees"
            icon={<Users className="size-6" />}
          />
          <StatCard
            title="Active"
            value={summary?.activeEmployees ?? 0}
            variant="success"
            href="/admin/employees"
            icon={<Users className="size-6" />}
          />
          <StatCard
            title="Inactive"
            value={summary?.inactiveEmployees ?? 0}
            variant="default" 
            href="/admin/employees"
            icon={<Users className="size-6" />}
          />
          <StatCard
            title="Departments"
            value={summary?.departments ?? 0}
            href="/admin/departments"
            icon={<Building2 className="size-6" />}
          />
        </div>
      </section>
    </main>
  );
}