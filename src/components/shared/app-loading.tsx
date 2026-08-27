"use client";

import { Loader2 } from "lucide-react";

interface AppLoadingProps {
  message?: string;
}

export function AppLoading({
  message = "Loading...",
}: AppLoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}
