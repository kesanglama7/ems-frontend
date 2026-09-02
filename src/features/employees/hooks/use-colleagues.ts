import { useQuery } from "@tanstack/react-query";

import { getDepartmentColleagues } from "../api/employee.api";
import { employeeKeys } from "../constants/employee.constants";

export function useColleagues() {
  return useQuery({
    queryKey: employeeKeys.colleagues(),
    queryFn: getDepartmentColleagues,
  });
}
