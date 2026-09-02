"use client";

import { useColleagues } from "@/features/employees/hooks/use-colleagues";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/name-shorten";

export default function EmployeeColleaguesPage() {
  const { data, isLoading } = useColleagues();
  const colleagues = data?.data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Colleagues
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Team members in your department
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : colleagues.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {colleagues.map((colleague) => (
            <Card key={colleague.id}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="size-20">
                    <AvatarImage
                      src={colleague.profileImageUrl}
                      alt={`${colleague.firstName} ${colleague.lastName}`}
                    />
                    <AvatarFallback className="text-base">
                      {getInitials(colleague.firstName, colleague.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {colleague.firstName} {colleague.lastName}
                    </p>
                    {colleague.jobTitle && (
                      <p className="truncate text-sm text-muted-foreground">
                        {colleague.jobTitle}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No colleagues found in your department.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
