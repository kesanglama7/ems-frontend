import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { uploadMyDocument } from "../api/documents.api";
import { documentKeys } from "../api/document.keys";

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMyDocument,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
      });

      toast.success("Document uploaded successfully.");
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}