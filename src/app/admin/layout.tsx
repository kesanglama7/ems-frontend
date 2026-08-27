import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AdminShell } from "@/layouts/admin/admin-shell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: Readonly<AdminLayoutProps>) {
  return (
    <AuthGuard allowedRole="ADMIN">
      <AdminShell>
        {children}
      </AdminShell>
    </AuthGuard>
  );
}
