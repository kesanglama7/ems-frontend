import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { getMyDocumentFile } from "../api/documents.api";

export function useDocumentFile() {
  return useMutation({
    mutationFn: getMyDocumentFile,

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}