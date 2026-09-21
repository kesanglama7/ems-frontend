"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Calendar as CalendarIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { EmptyState, QueryFeedback } from "@/components/shared/admin/shared";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";
import { HolidayDialog } from "./holidays-calendar-dialog";
import { useDeleteHoliday, useHolidays } from "../hooks";
import type { Holiday } from "../types";
import { formatOfficeDate, localDateInput } from "@/lib/general";

export function HolidaysCalendar({ admin = false }: { admin?: boolean }) {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | undefined>();
  const [editing, setEditing] = useState<Holiday | "new" | null>(null);

  const year = month.getFullYear();
  const query = useHolidays(year);
  const holidays = query.data?.data ?? [];
  const closed = holidays.filter((holiday: any) => holiday.isOfficeClosed);
  const confirm = useConfirmDialogStore((state) => state.confirm);
  const remove = useDeleteHoliday();

  const selectedDate =
    selected && selected.getFullYear() === year
      ? localDateInput(selected)
      : undefined;
      
  const selectedHoliday = selectedDate
    ? holidays.find((holiday) => holiday.date.slice(0, 10) === selectedDate)
    : undefined;

  const confirmDelete = (holiday: Holiday) => {
    confirm({
      title: "Delete calendar entry?",
      description: `Remove ${holiday.name} on ${formatOfficeDate(holiday.date)}?`,
      confirmLabel: "Delete entry",
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(holiday.id);
      },
    });
  };

  // UX Improvement: Group holidays by month for better scanning
  const groupedHolidays = useMemo(() => {
    const groups: Record<string, Holiday[]> = {};
    holidays.forEach((holiday) => {
      const date = new Date(`${holiday.date.slice(0, 10)}T12:00:00`);
      const monthName = date.toLocaleDateString(undefined, { month: "long" });
      if (!groups[monthName]) groups[monthName] = [];
      groups[monthName].push(holiday);
    });
    return groups;
  }, [holidays]);

  return (
    <main className="mx-auto w-full space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="size-5 text-muted-foreground" />
              Yearly Schedule ({year})
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMonth(new Date())}
              >
                Today
              </Button>
              <div className="flex items-center gap-1 border-l pl-2">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Previous year"
                  onClick={() =>
                    setMonth(new Date(year - 1, month.getMonth(), 1))
                  }
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="w-12 text-center font-medium">{year}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Next year"
                  onClick={() =>
                    setMonth(new Date(year + 1, month.getMonth(), 1))
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-6 self-start lg:sticky lg:top-6">
          <div className="rounded-xl border bg-card p-3 shadow-sm">
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              onSelect={setSelected}
              modifiers={{
                closed: closed.map(
                  (holiday) =>
                    new Date(`${holiday.date.slice(0, 10)}T12:00:00`),
                ),
              }}
              modifiersClassNames={{
                closed:
                  "bg-rose-100 text-rose-900 font-semibold rounded-md dark:bg-rose-950 dark:text-rose-200",
              }}
              className="mx-auto"
            />
          </div>

          <div className="flex items-center gap-3 px-1 text-sm text-muted-foreground">
            <span className="size-3.5 rounded-sm bg-rose-100 dark:bg-rose-900 border border-rose-200 dark:border-rose-800" />
            <span>Office closed (No leave deduction)</span>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <CalendarIcon className="size-4 text-muted-foreground" />
              {closed.length} closure days in {year}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Informational festivals keep the office open. Calendar dates
              follow the office&apos;s local timezone.
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight">Upcoming Holidays</h1>

          <QueryFeedback
            pending={query.isPending}
            error={query.isError}
            retry={query.refetch}
          />
          {selectedDate && (
            <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm flex  justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Selected Date
                </p>
                <p className="mt-1 text-lg font-medium">{formatOfficeDate(selectedDate)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedHoliday?.name ?? "No events scheduled for this day."}
                </p>
              </div>
              {admin && (
                <Button
                  className="w-auto cursor-pointer"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(selectedHoliday ?? "new")}
                >
                  {selectedHoliday ? "Edit Event" : "Add Event"}
                </Button>
              )}
            </div>
          )}

          {query.isSuccess && (
            holidays.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedHolidays).map(([monthName, monthHolidays]) => (
                  <div key={monthName} className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground pl-1">
                      {monthName}
                    </h3>
                    <div className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
                      {monthHolidays.map((holiday) => (
                        <article
                          key={holiday.id}
                          className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/30"
                        >
                          <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border bg-background py-2 text-center shadow-sm">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">
                              {new Date(
                                `${holiday.date.slice(0, 10)}T12:00:00`,
                              ).toLocaleDateString(undefined, { weekday: "short" })}
                            </span>
                            <span className="text-xl font-bold text-foreground">
                              {holiday.date.slice(8, 10)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 py-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-semibold text-foreground">
                                {holiday.name}
                              </h4>
                              {/* UX Improvement: Clear visual distinction for status */}
                              <Badge
                                variant={holiday.isOfficeClosed ? "destructive" : "outline"}
                                className={holiday.isOfficeClosed ? "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200" : "text-muted-foreground"}
                              >
                                {holiday.isOfficeClosed ? "Office Closed" : "Observance (Open)"}
                              </Badge>
                            </div>
                            {holiday.description && (
                              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                                {holiday.description}
                              </p>
                            )}
                          </div>
                          {admin && (
                            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 md:opacity-100">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                aria-label={`Edit ${holiday.name}`}
                                onClick={() => setEditing(holiday)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                disabled={remove.isPending}
                                aria-label={`Delete ${holiday.name}`}
                                onClick={() => confirmDelete(holiday)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState >
                <CalendarDays className="mx-auto mb-4 size-10 text-muted-foreground/50" />
                No calendar entries scheduled for {year}.
              </EmptyState>
            )
          )}
        </section>
      </div>

      {editing && (
        <HolidayDialog
          key={editing === "new" ? "new" : editing.id}
          item={editing === "new" ? undefined : editing}
          initialDate={
            selected && selected.getFullYear() === year
              ? localDateInput(selected)
              : `${year}-01-01`
          }
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}