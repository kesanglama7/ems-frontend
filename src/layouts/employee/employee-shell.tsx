"use client";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth.store";

import { EmployeeHeader } from "./employee-header";
import { EmployeeSidebar } from "./employee-sidebar";

interface EmployeeShellProps {
  children: React.ReactNode;
}

export function EmployeeShell({
  children,
}: EmployeeShellProps) {
  const user = useAuthStore(
    (state) => state.user,
  );

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <EmployeeSidebar user={user} />

      <SidebarInset>
        <EmployeeHeader />

        <div className="flex flex-1 flex-col p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
