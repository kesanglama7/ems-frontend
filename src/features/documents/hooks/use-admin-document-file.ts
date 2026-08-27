import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { getAdminDocumentFile } from "../api/admin-documents.api";

export function useAdminDocumentFile() {
  return useMutation({
    mutationFn: getAdminDocumentFile,

    onError: (error) => {
      toast.error(
        getApiErrorMessage(error),
      );
    },
  });
}