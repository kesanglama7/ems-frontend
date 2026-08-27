import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createDepartment } from "../api/departments.api";
import { departmentKeys } from "../constants/department.constants";

export function useCreateDepartment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: createDepartment,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          departmentKeys.lists(),
      });
    },
  });
}