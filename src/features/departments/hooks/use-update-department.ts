import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateDepartment } from "../api/departments.api";
import type { UpdateDepartmentPayload } from "../types/department.types";
import { departmentKeys } from "../constants/department.constants";

interface Variables {
  departmentId: string;
  payload: UpdateDepartmentPayload;
}

export function useUpdateDepartment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      payload,
    }: Variables) =>
      updateDepartment(
        departmentId,
        payload,
      ),

    onSuccess: async (
      _response,
      variables,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            departmentKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey:
            departmentKeys.detail(
              variables.departmentId,
            ),
        }),
      ]);
    },
  });
}