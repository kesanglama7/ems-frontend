import { EmployeeDetails } from "@/features/employees/components/employee-details";

interface EmployeeDetailsPageProps {
  params: Promise<{
    employeeId: string;
  }>;
}

export default async function EmployeeDetailsPage({
  params,
}: EmployeeDetailsPageProps) {
  const { employeeId } = await params;

  return (
    <EmployeeDetails
      employeeId={employeeId}
    />
  );
}