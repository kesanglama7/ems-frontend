import { useQuery } from "@tanstack/react-query";

import { getDepartment } from "../api/departments.api";
import { departmentKeys } from "../constants/department.constants";

export function useDepartment(
  departmentId: string,
) {
  return useQuery({
    queryKey:
      departmentKeys.detail(
        departmentId,
      ),

    queryFn: () =>
      getDepartment(
        departmentId,
      ),

    enabled:
      Boolean(departmentId),
  });
}