import type {
  UserRole,
  UserStatus,
  UserWorkMode,
} from "@/types/user.types";

export interface EmployeeDepartment {
  id: string;
  name: string;
  isActive: boolean;
}

export interface EmployeeUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string | null;
  dateOfJoining: string | null;
  profileImageUrl: string | undefined;
  departmentId: string | null;
  department: EmployeeDepartment | null;
  workMode: UserWorkMode;
  user: EmployeeUser;
}

export interface EmployeeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: UserStatus;
  workMode?: UserWorkMode;
}

export interface EmployeeListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeeListResponse {
  success: boolean;
  data: EmployeeListItem[];
  meta: EmployeeListMeta;
}

export interface CreateEmployeePayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  workMode: UserWorkMode;
  jobTitle?: string;
  departmentId?: string;
  dateOfJoining?: string;
}

export interface CreatedEmployee
  extends EmployeeListItem {
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeResponse {
  success: boolean;
  message: string;
  data: CreatedEmployee;
}


export interface EmployeeDepartmentDetails {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface EmployeeUserDetails {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDetails {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string | null;
  dateOfJoining: string | null;
  profileImagePath: string | null;
  workMode: UserWorkMode;
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
  department: EmployeeDepartmentDetails | null;
  user: EmployeeUserDetails;
}

export interface EmployeeDetailsResponse {
  success: boolean;
  data: EmployeeDetails;
}


export interface UpdateEmployeePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  departmentId?: string | null;
  dateOfJoining?: string | null;
  workMode?: UserWorkMode;
}

export interface UpdateEmployeeResponse {
  success: boolean;
  message: string;
  data: EmployeeListItem;
}

export interface UpdateEmployeeStatusPayload {
  status: UserStatus;
}

export interface UpdateEmployeeStatusResponse {
  success: boolean;
  message: string;
  data: {
    employeeId: string;
    user: {
      id: string;
      email: string;
      role: UserRole;
      status: UserStatus;
    };
  };
}

// ─── Team members ───────────────────────────────────────────────────────────

export interface TeamMemberListQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
}

export interface TeamMemberDepartment {
  id: string;
  name: string;
}

export interface TeamMembersResponse {
  success: boolean;
  data: TeamMember[];
  meta: EmployeeListMeta;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  email: string;
  department: TeamMemberDepartment | null;
  profileImageUrl: string | null;
}