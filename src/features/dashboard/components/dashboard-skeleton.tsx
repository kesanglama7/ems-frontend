"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Sections Skeleton */}
      {[1, 2].map((section) => (
        <div key={section} className="space-y-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}