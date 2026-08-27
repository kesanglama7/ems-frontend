"use client";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth.store";

import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({
  children,
}: AdminShellProps) {
  const user = useAuthStore(
    (state) => state.user,
  );

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={user} />

      <SidebarInset>
        <AdminHeader />

        <div className="flex flex-1 flex-col p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
