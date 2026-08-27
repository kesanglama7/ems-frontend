import { useQuery } from "@tanstack/react-query";

import { getAdminDocuments } from "../api/admin-documents.api";
import { documentKeys } from "../api/document.keys";
import type { AdminDocumentListFilters } from "../types/document.types";

export function useAdminDocuments(
  filters: AdminDocumentListFilters = {},
) {
  return useQuery({
    queryKey: documentKeys.adminList(filters),
    queryFn: () => getAdminDocuments(filters),
  });
}