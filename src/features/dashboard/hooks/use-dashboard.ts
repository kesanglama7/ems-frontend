import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../api/dashboard.api";
import { dashboardKeys } from "../constants/dashboard.constants";
import type { DashboardSummary } from "../types/dashboard.types";

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: dashboardKeys.admin(),
    queryFn: async () => {
      const response = await getDashboardData();
      return response.data.summary;
    },
  });
}