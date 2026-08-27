import { AuthGuard } from "@/features/auth/components/auth-guard";
import { EmployeeShell } from "@/layouts/employee/employee-shell";

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default function EmployeeLayout({
  children,
}: Readonly<EmployeeLayoutProps>) {
  return (
    <AuthGuard allowedRole="EMPLOYEE">
      <EmployeeShell>
        {children}
      </EmployeeShell>
    </AuthGuard>
  );
}
