import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { DocumentStatus } from "../types/document.types";
import { DOCUMENT_STATUS_LABELS } from "../utils/document.utils";

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

const statusClassNames: Record<DocumentStatus, string> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",

  VERIFIED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",

  REJECTED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400",
};

export function DocumentStatusBadge({
  status,
}: DocumentStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        statusClassNames[status],
      )}
    >
      {DOCUMENT_STATUS_LABELS[status]}
    </Badge>
  );
}