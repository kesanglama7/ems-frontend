"use client";

import { useAuthStore } from "@/stores/auth.store";
import { LiveClock } from "@/features/attendance/components/employee/live-clock";
import { CheckInControl } from "@/features/attendance/components/employee/check-in-control";
import { useOfficeSettings } from "@/features/office-settings/hooks/use-office-settings";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarDays, Briefcase, AlertCircle } from "lucide-react";
import { useMyEmployeeProfile } from "@/features/employees/hooks/use-my-employee-profile";

const DAY_MAP: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

export default function EmployeeDashboardPage() {
    const {
    data: profile,
  } = useMyEmployeeProfile();
  const { data: settings, isLoading } = useOfficeSettings();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const workingDayNumbers = settings?.workingDays.map(day => DAY_MAP[day]) || [1,2,3,4,5];
  const isOffDay = (date: Date) => !workingDayNumbers.includes(date.getDay());

  return (
    <main className="flex flex-1 flex-col gap-6  max-w-8xl mx-auto w-full">
      
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8 border border-primary/10 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {greeting}, {profile?.firstName || "Team Member"}! 👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            {settings?.officeName ? `Welcome to ${settings.officeName} portal.` : "Here's your attendance overview for today."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        
        {/* Left Column: Schedule & Calendar */}
        <div className="space-y-6 md:col-span-7 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Schedule & Calendar
              </CardTitle>
              <CardDescription>Your working days and office timings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col xl:flex-row gap-8">
              
              <div className="flex-shrink-0 flex justify-center rounded-xl border bg-card p-3">
                <Calendar
                  mode="single"
                  selected={new Date()} 
                  disabled={isOffDay}
                  className="pointer-events-none"
                />
              </div>

              {/* Office Details */}
              <div className="flex flex-col gap-4 flex-1">
                {isLoading ? (
                   <div className="h-32 animate-pulse bg-muted rounded-xl" />
                ) : settings ? (
                  <>
                    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>Shift Timings</span>
                      </div>
                      <div className="text-xl font-semibold">
                        {settings.workStartTime} - {settings.workEndTime}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {settings.workingDays.map((day) => (
                          <Badge key={day} variant="secondary" className="text-xs font-normal">
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Grace Period</p>
                          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                            You have a {settings.gracePeriodMinutes}-minute grace period after {settings.workStartTime} before you are marked late.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Unable to load schedule.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Clock & Actions */}
        <div className="space-y-6 md:col-span-5 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Time & Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center rounded-xl bg-muted/30 p-6 border shadow-inner">
                <LiveClock />
                {settings?.timezone && (
                  <span className="text-xs text-muted-foreground mt-2">
                    {settings.timezone}
                  </span>
                )}
              </div>
              <CheckInControl />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}