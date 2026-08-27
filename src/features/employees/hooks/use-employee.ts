import { useQuery } from "@tanstack/react-query";
import { employeeKeys } from "../constants/employee.constants";
import { getEmployee } from "../api/employee.api";


export function useEmployee(
  employeeId: string,
) {
  return useQuery({
    queryKey:
      employeeKeys.detail(employeeId),

    queryFn: () =>
      getEmployee(employeeId),

    enabled: Boolean(employeeId),
  });
}