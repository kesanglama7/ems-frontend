import { NotificationBell } from "@/features/notifications/notification-bell";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMyEmployeeProfile } from "@/features/employees/hooks/use-my-employee-profile";

export function EmployeeHeader() {
    const { data: profile } = useMyEmployeeProfile();
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 py-2">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 h-auto"
      />

      <div>
        <p className="text-sm font-medium">
          {profile?.firstName} { profile?.lastName}
        </p>
      </div>
      <NotificationBell />
    </header>
  );
}
