import { useQuery } from "@tanstack/react-query";

import { getTeamMembers } from "../api/employee.api";
import { employeeKeys } from "../constants/employee.constants";
import type { TeamMemberListQuery } from "../types/employee.types";

export function useColleagues(
  query: TeamMemberListQuery = {},
) {
  return useQuery({
    queryKey: [...employeeKeys.colleagues(), query],
    queryFn: () => getTeamMembers(query),
  });
}