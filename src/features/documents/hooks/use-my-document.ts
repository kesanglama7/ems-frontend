import { useQuery } from "@tanstack/react-query";

import { getMyDocument } from "../api/documents.api";
import { documentKeys } from "../api/document.keys";

export function useMyDocument(
  documentId: string | undefined,
) {
  return useQuery({
    queryKey: documentKeys.detail(documentId ?? ""),
    queryFn: () => getMyDocument(documentId!),
    enabled: Boolean(documentId),
  });
}