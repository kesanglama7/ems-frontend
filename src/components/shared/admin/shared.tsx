"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
export function Choice({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        className,
      )}
    />
  );
}
export function QueryFeedback({
  pending,
  error,
  retry,
}: {
  pending: boolean;
  error: boolean;
  retry: () => unknown;
}) {
  if (pending)
    return (
      <div
        role="status"
        className="flex items-center gap-2 p-6 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-4 animate-spin" />
        Loading…
      </div>
    );
  if (error)
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm"
      >
        <AlertCircle className="size-4 text-destructive" />
        Could not load this information.
        <Button variant="outline" size="sm" onClick={() => void retry()}>
          Try again
        </Button>
      </div>
    );
  return null;
}
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
