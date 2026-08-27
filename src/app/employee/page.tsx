"use client";

import { useAuthStore } from "@/stores/auth.store";

export default function EmployeeDashboardPage() {
  const user = useAuthStore(
    (state) => state.user,
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Employee Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>

      <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Dashboard features will be added as their backend APIs become available.
      </div>
    </main>
  );
}
