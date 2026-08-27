import { useQuery } from "@tanstack/react-query";

import { getAdminDocument } from "../api/admin-documents.api";
import { documentKeys } from "../api/document.keys";

export function useAdminDocument(
  documentId: string | undefined,
) {
  return useQuery({
    queryKey: documentKeys.adminDetail(
      documentId ?? "",
    ),

    queryFn: () =>
      getAdminDocument(documentId!),

    enabled: Boolean(documentId),
  });
}