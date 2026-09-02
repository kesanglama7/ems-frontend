import { api } from "@/lib/api";
import { DashboardResponse } from "../types/dashboard.types";

export async function getDashboardData(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>("/admin/dashboard");
  return response.data;
}