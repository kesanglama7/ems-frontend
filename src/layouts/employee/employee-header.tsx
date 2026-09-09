import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/features/notifications/notification-bell";

export function EmployeeHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 h-4"
      />

      <div>
        <p className="text-sm font-medium">
          Employee Portal
        </p>
      </div>
      <NotificationBell />
    </header>
  );
}
