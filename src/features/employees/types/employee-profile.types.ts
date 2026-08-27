export interface EmployeeProfileDepartment {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface EmployeeProfileUser {
  id: string;
  email: string;
  role: "EMPLOYEE";
  status: string;
}

export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string | null;
  dateOfJoining: string | null;

  userId: string;
  departmentId: string | null;

  createdAt: string;
  updatedAt: string;

  department: EmployeeProfileDepartment | null;
  user: EmployeeProfileUser;

  profileImageUrl: string | null;
}

export interface UpdateMyProfilePayload {
  phone?: string | null;
}

export interface ProfileImageUploadResult {
  profileImagePath: string;
}
