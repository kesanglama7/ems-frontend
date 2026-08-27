"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyEmployeeProfile } from "../api/employee-profile.api";
import { employeeKeys } from "../constants/employee.constants";

export function useMyEmployeeProfile() {
  return useQuery({
    queryKey: employeeKeys.me(),
    queryFn: getMyEmployeeProfile,
  });
}
