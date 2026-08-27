import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type { UpdateEmployeePayload } from "../types/employee.types";
import { updateEmployee } from "../api/employee.api";
import { employeeKeys } from "../constants/employee.constants";

interface UpdateEmployeeVariables {
  employeeId: string;
  payload: UpdateEmployeePayload;
}

export function useUpdateEmployee() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      payload,
    }: UpdateEmployeeVariables) =>
      updateEmployee(
        employeeId,
        payload,
      ),

    onSuccess: async (
      _response,
      variables,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            employeeKeys.detail(
              variables.employeeId,
            ),
        }),

        queryClient.invalidateQueries({
          queryKey:
            employeeKeys.lists(),
        }),
      ]);
    },
  });
}