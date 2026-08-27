import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { deleteMyDocument } from "../api/documents.api";
import { documentKeys } from "../api/document.keys";

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyDocument,

    onSuccess: async (_, documentId) => {
      queryClient.removeQueries({
        queryKey: documentKeys.detail(documentId),
      });

      await queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
      });

      toast.success("Document deleted successfully.");
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}