import { useQuery } from "@tanstack/react-query";

import { getMyDocuments } from "../api/documents.api";
import { documentKeys } from "../api/document.keys";

export function useMyDocuments() {
  return useQuery({
    queryKey: documentKeys.list(),
    queryFn: getMyDocuments,
  });
}