import { useInfiniteQuery } from "@tanstack/react-query";

import type { EmployeeListQuery } from "../types/employee.types";
import { employeeKeys } from "../constants/employee.constants";
import { getEmployees } from "../api/employee.api";

export function useEmployeesInfinite(baseQuery: Omit<EmployeeListQuery, "page">) {
  return useInfiniteQuery({
    queryKey: employeeKeys.list(baseQuery),
    queryFn: ({ pageParam = 1 }) =>
      getEmployees({ ...baseQuery, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
}
