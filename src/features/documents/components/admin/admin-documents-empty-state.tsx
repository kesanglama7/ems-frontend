import { Files } from "lucide-react";

interface AdminDocumentsEmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function AdminDocumentsEmptyState({
  hasFilters,
  onResetFilters,
}: AdminDocumentsEmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-muted">
        <Files className="size-5 text-muted-foreground" />
      </div>

      <h3 className="font-semibold">
        {hasFilters
          ? "No matching documents"
          : "No employee documents"}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "No documents match the selected filters."
          : "Employee documents will appear here after they are uploaded."}
      </p>

      {hasFilters && (
        <button
          type="button"
          className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
          onClick={onResetFilters}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}