import { useQuery } from "@tanstack/react-query";

import { getDepartments } from "../api/departments.api";
import { departmentKeys } from "../constants/department.constants";

export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.list(),
    queryFn: getDepartments,
  });
}