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
      await Promise.all(["leaves", "birthdays", "birthday-greeting"].map(key => queryClient.invalidateQueries({ queryKey: [key] })));
      await queryClient.invalidateQueries({
        queryKey:
          employeeKeys.lists(),
      });
    },
  });
}