import { api } from "@/lib/api";

import type {
  CreateEmployeePayload,
  CreateEmployeeResponse,
  EmployeeDetailsResponse,
  EmployeeListQuery,
  EmployeeListResponse,
  TeamMemberListQuery,
  TeamMembersResponse,
  UpdateEmployeePayload,
  UpdateEmployeeResponse,
  UpdateEmployeeStatusPayload,
  UpdateEmployeeStatusResponse,
} from "../types/employee.types";

export async function getEmployees(
  query: EmployeeListQuery,
): Promise<EmployeeListResponse> {
  const response =
    await api.get<EmployeeListResponse>(
      "/employees",
      {
        params: query,
      },
    );

  return response.data;
}

export async function getEmployee(
  employeeId: string,
): Promise<EmployeeDetailsResponse> {
  const response =
    await api.get<EmployeeDetailsResponse>(
      `/employees/${employeeId}`,
    );

  return response.data;
}

export async function createEmployee(
  payload: CreateEmployeePayload,
): Promise<CreateEmployeeResponse> {
  const response =
    await api.post<CreateEmployeeResponse>(
      "/employees",
      payload,
    );

  return response.data;
}


export async function updateEmployee(
  employeeId: string,
  payload: UpdateEmployeePayload,
): Promise<UpdateEmployeeResponse> {
  const response =
    await api.patch<UpdateEmployeeResponse>(
      `/employees/${employeeId}`,
      payload,
    );

  return response.data;
}


export async function updateEmployeeStatus(
  employeeId: string,
  payload: UpdateEmployeeStatusPayload,
): Promise<UpdateEmployeeStatusResponse> {
  const response =
    await api.patch<UpdateEmployeeStatusResponse>(
      `/employees/${employeeId}/status`,
      payload,
    );

  return response.data;
}

export async function getTeamMembers(
  query: TeamMemberListQuery = {},
): Promise<TeamMembersResponse> {
  const response = await api.get<TeamMembersResponse>(
    "/employees/team-members",
    { params: query },
  );

  return response.data;
}
