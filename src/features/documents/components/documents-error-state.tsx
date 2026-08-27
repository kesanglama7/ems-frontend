import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DocumentsErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function DocumentsErrorState({
  message,
  onRetry,
  isRetrying = false,
}: DocumentsErrorStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-5 text-destructive" />
      </div>

      <h3 className="font-semibold">
        Unable to load documents
      </h3>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {message}
      </p>

      <Button
        variant="outline"
        className="mt-4"
        disabled={isRetrying}
        onClick={onRetry}
      >
        <RefreshCw
          className={
            isRetrying
              ? "animate-spin"
              : undefined
          }
        />

        Try again
      </Button>
    </div>
  );
}