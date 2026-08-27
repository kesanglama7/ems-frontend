import { FileText } from "lucide-react";

export function DocumentsEmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-muted">
        <FileText className="size-5 text-muted-foreground" />
      </div>

      <h3 className="font-semibold">
        No documents yet
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Your uploaded documents will appear here.
      </p>
    </div>
  );
}