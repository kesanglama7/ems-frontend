import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import type { EmployeeListQuery } from "../types/employee.types";
import { employeeKeys } from "../constants/employee.constants";
import { getEmployees } from "../api/employee.api";

export function useEmployees(
  query: EmployeeListQuery,
) {
  return useQuery({
    queryKey: employeeKeys.list(query),
    queryFn: () => getEmployees(query),
    placeholderData: keepPreviousData,
  });
}
