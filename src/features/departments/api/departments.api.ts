import { api } from "@/lib/api";

import type {
  CreateDepartmentPayload,
  CreateDepartmentResponse,
  DeactivateDepartmentResponse,
  DepartmentDetailsResponse,
  DepartmentListResponse,
  UpdateDepartmentPayload,
  UpdateDepartmentResponse,
} from "../types/department.types";

export async function getDepartments(): Promise<DepartmentListResponse> {
  const response =
    await api.get<DepartmentListResponse>(
      "/departments",
    );

  return response.data;
}

export async function getDepartment(
  departmentId: string,
): Promise<DepartmentDetailsResponse> {
  const response =
    await api.get<DepartmentDetailsResponse>(
      `/departments/${departmentId}`,
    );

  return response.data;
}

export async function createDepartment(
  payload: CreateDepartmentPayload,
): Promise<CreateDepartmentResponse> {
  const response =
    await api.post<CreateDepartmentResponse>(
      "/departments",
      payload,
    );

  return response.data;
}

export async function updateDepartment(
  departmentId: string,
  payload: UpdateDepartmentPayload,
): Promise<UpdateDepartmentResponse> {
  const response =
    await api.patch<UpdateDepartmentResponse>(
      `/departments/${departmentId}`,
      payload,
    );

  return response.data;
}

export async function deactivateDepartment(
  departmentId: string,
): Promise<DeactivateDepartmentResponse> {
  const response =
    await api.delete<DeactivateDepartmentResponse>(
      `/departments/${departmentId}`,
    );

  return response.data;
}