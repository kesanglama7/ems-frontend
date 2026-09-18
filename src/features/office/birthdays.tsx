"use client";
import { useState } from "react";
import { Cake, Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoginAnnouncementsDialog } from "@/features/announcements/components/employee/login-announcements-dialog";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/name-shorten";
import {
  useOfficeMutation,
  useOfficeQuery,
  formatOfficeDate,
  type Birthday,
  type Greeting,
} from "./api";
import { EmptyState, QueryFeedback } from "../../components/shared/admin/shared";

export function UpcomingBirthdays() {
  const query = useOfficeQuery<Birthday[]>(
    "birthdays",
    "/dashboard/birthdays?days=30",
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="size-5 text-primary" />
          Upcoming birthdays
        </CardTitle>
        <CardDescription>
          Celebrate your teammates · Next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QueryFeedback
          pending={query.isPending}
          error={query.isError}
          retry={query.refetch}
        />
        {query.isSuccess &&
          (query.data.data.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {query.data.data.map((person) => (
                <div
                  key={person.employeeId}
                  className={`flex items-center gap-3 rounded-xl border p-4 ${person.isToday ? "border-primary/30 bg-primary/5" : "bg-muted/20"}`}
                >
                  <Avatar className="size-12">
                    <AvatarImage
                      src={person.profileImageUrl ?? undefined}
                      alt={person.name}
                    />
                    <AvatarFallback>
                      {getInitials(
                        person.name.split(" ")[0] ?? "",
                        person.name.split(" ").slice(1).join(" "),
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{person.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatOfficeDate(person.birthday)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary">
                      {person.isToday
                        ? "Happy birthday! 🎉"
                        : person.daysUntil === 1
                          ? "Tomorrow"
                          : `In ${person.daysUntil} days`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No birthdays in the next 30 days.</EmptyState>
          ))}
      </CardContent>
    </Card>
  );
}

export function LoginCelebrations() {
  const query = useOfficeQuery<Greeting>(
    "birthday-greeting",
    "/dashboard/birthdays/greeting",
  );
  const [dismissed, setDismissed] = useState<string | null>(null);
  const greeting = query.data?.data;
  const show = Boolean(
    greeting?.showPopup && greeting.celebrationKey !== dismissed,
  );
  const dismiss = useOfficeMutation(
    () => api.post("/dashboard/birthdays/greeting/dismiss"),
    "Have a wonderful birthday!",
    ["birthday-greeting"],
  );
  async function close() {
    if (dismiss.isPending || !greeting) return;
    try {
      await dismiss.mutateAsync();
      setDismissed(greeting.celebrationKey ?? "dismissed");
    } catch {
      /* Keep open so dismissal can be retried. */
    }
  }
  return (
    <>
      <Dialog
        open={show}
        onOpenChange={(open) => {
          if (!open) void close();
        }}
      >
        <DialogContent className="overflow-hidden text-center sm:max-w-md">
          <div
            aria-hidden="true"
            className="birthday-confetti pointer-events-none absolute inset-0 overflow-hidden"
          >
            {Array.from({ length: 32 }, (_, i) => (
              <span
                key={i}
                style={{
                  left: `${(i * 37) % 100}%`,
                  backgroundColor: [
                    "#f59e0b",
                    "#ec4899",
                    "#8b5cf6",
                    "#10b981",
                    "#38bdf8",
                  ][i % 5],
                  animationDelay: `${(i % 8) * 0.13}s`,
                  transform: `rotate(${i * 29}deg)`,
                }}
              />
            ))}
          </div>
          <DialogHeader className="relative items-center pt-5">
            <div className="mb-3 flex size-20 items-center justify-center rounded-full bg-primary/10">
              <Cake className="size-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Happy birthday! 🎉</DialogTitle>
            <DialogDescription className="pt-3 text-base leading-7 text-foreground">
              {greeting?.message}
            </DialogDescription>
          </DialogHeader>
          <p className="relative flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4" />
            From everyone at {greeting?.officeName}
          </p>
          <Button
            className="relative mt-3"
            onClick={() => void close()}
            disabled={dismiss.isPending}
          >
            {dismiss.isPending ? "Saving…" : "Thank you!"}
          </Button>
        </DialogContent>
      </Dialog>
      <LoginAnnouncementsDialog enabled={!query.isPending && !show} />
    </>
  );
}
