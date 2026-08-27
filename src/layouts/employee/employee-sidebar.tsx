"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FileText,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { SidebarUserMenu } from "@/components/shared/sidebar-user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { AuthUser } from "@/features/auth/types/auth.types";

interface EmployeeSidebarProps
  extends React.ComponentProps<typeof Sidebar> {
  user: AuthUser;
}

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const employeeNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/employee",
    icon: LayoutDashboard,
  },
  {
    title: "Documents",
    href: "/employee/documents",
    icon: FileText,
  },
];

function isNavItemActive(
  pathname: string,
  href: string,
) {
  if (href === "/employee") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function EmployeeSidebar({
  user,
  ...props
}: EmployeeSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/employee" onClick={handleNavigation} />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <UserRound className="size-4" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  EMS
                </span>
                <span className="truncate text-xs">
                  Employee Portal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Application
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {employeeNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(
                  pathname,
                  item.href,
                );

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} onClick={handleNavigation} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserMenu user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
