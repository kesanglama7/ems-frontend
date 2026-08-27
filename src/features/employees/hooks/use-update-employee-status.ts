import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  UpdateEmployeeStatusPayload,
} from "../types/employee.types";
import { updateEmployeeStatus } from "../api/employee.api";
import { employeeKeys } from "../constants/employee.constants";

interface UpdateEmployeeStatusVariables {
  employeeId: string;
  payload: UpdateEmployeeStatusPayload;
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      payload,
    }: UpdateEmployeeStatusVariables) =>
      updateEmployeeStatus(
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