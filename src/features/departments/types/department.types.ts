export interface Department {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentListResponse {
  success: boolean;
  data: Department[];
}

export interface DepartmentDetailsResponse {
  success: boolean;
  data: Department;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}

export interface CreateDepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

export interface DeactivateDepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}