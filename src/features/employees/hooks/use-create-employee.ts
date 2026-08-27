import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createEmployee } from "../api/employee.api";
import { employeeKeys } from "../constants/employee.constants";

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          employeeKeys.lists(),
      });
    },
  });
}