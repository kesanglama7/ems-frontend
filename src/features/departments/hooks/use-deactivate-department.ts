import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { deactivateDepartment } from "../api/departments.api";
import { departmentKeys } from "../constants/department.constants";

export function useDeactivateDepartment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deactivateDepartment,

    onSuccess: async (
      _response,
      departmentId,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            departmentKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey:
            departmentKeys.detail(
              departmentId,
            ),
        }),
      ]);
    },
  });
}