import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { rejectAdminDocument } from "../api/admin-documents.api";
import { documentKeys } from "../api/document.keys";

export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectAdminDocument,

    onSuccess: async (
      _document,
      variables,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            documentKeys.adminLists(),
        }),

        queryClient.invalidateQueries({
          queryKey:
            documentKeys.adminDetail(
              variables.documentId,
            ),
        }),
      ]);

      toast.success(
        "Document rejected successfully.",
      );
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(error),
      );
    },
  });
}