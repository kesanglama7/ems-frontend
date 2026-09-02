export interface DashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departments: number;

  checkedInToday: number;
  currentlyWorking: number;
  checkedOutToday: number;
  lateToday: number;

  pendingLeaveRequests: number;
  pendingDocuments: number;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    summary: DashboardSummary;
  };
}