import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { verifyAdminDocument } from "../api/admin-documents.api";
import { documentKeys } from "../api/document.keys";

export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyAdminDocument,

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
        "Document verified successfully.",
      );
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(error),
      );
    },
  });
}