// "use client";

// import {
//   useState,
//   type ComponentProps,
// } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   Bell,
//   Building2,
//   CalendarCheck,
//   CalendarDays,
//   ChevronRight,
//   FileText,
//   LayoutDashboard,
//   MessageSquareWarning,
//   Megaphone,
//   Settings,
//   Users,
//   type LucideIcon,
// } from "lucide-react";

// import { SidebarUserMenu } from "@/components/shared/sidebar-user-menu";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
//   SidebarRail,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import type { AuthUser } from "@/features/auth/types/auth.types";

// interface AdminSidebarProps
//   extends ComponentProps<typeof Sidebar> {
//   user: AuthUser;
// }

// interface NavLinkItem {
//   title: string;
//   href: string;
//   icon: LucideIcon;
//   exact?: boolean;
//   items?: never;
// }

// interface NavSubItem {
//   title: string;
//   href: string;
//   exact?: boolean;
// }

// interface NavGroupItem {
//   title: string;
//   icon: LucideIcon;
//   items: NavSubItem[];
//   href?: never;
//   exact?: never;
// }

// type NavItem = NavLinkItem | NavGroupItem;

// const adminNavigation: NavItem[] = [
//   {
//     title: "Dashboard",
//     href: "/admin",
//     icon: LayoutDashboard,
//     exact: true,
//   },
//   {
//     title: "Employees",
//     href: "/admin/employees",
//     icon: Users,
//   },
//   {
//     title: "Attendance",
//     href: "/admin/attendance",
//     icon: CalendarCheck,
//   },
//   {
//     title: "Documents",
//     href: "/admin/documents",
//     icon: FileText,
//   },
//   {
//     title: "Employee Requests",
//     icon: MessageSquareWarning,
//     items: [
//       {
//         title: "Requests",
//         href: "/admin/requests",
//         exact: true,
//       },
//       {
//         title: "Categories",
//         href: "/admin/requests/categories",
//       },
//     ],
//   },
//   {
//     title: "Leaves",
//     icon: CalendarDays,
//     items: [
//       {
//         title: "Requests",
//         href: "/admin/leaves/requests",
//       },
//       {
//         title: "Types",
//         href: "/admin/leaves/types",
//         exact: true,
//       },
//       {
//         title: "Balance",
//         href: "/admin/leaves/balance",
//       },
//     ],
//   },
//   {
//     title: "Departments",
//     href: "/admin/departments",
//     icon: Building2,
//   },
//   { title: "Resources", href: "/admin/resources", icon: Building2 },
//   {
//     title: "Announcements",
//     href: "/admin/announcements",
//     icon: Megaphone,
//   },
//   {
//     title: "Office Settings",
//     icon: Settings,
//     items: [
//       {
//         title: "General",
//         href: "/admin/office-settings",
//         exact: true,
//       },
//       {
//         title: "Calendar",
//         href: "/admin/office-calendar",
//       },
//     ],
//   },
//   {
//     title: "Notifications",
//     href: "/admin/notifications",
//     icon: Bell,
//   },
// ];

// function isNavGroupItem(
//   item: NavItem,
// ): item is NavGroupItem {
//   return Array.isArray(item.items);
// }

// function isPathActive(
//   pathname: string,
//   href: string,
//   exact = false,
// ) {
//   if (exact) {
//     return pathname === href;
//   }

//   return (
//     pathname === href ||
//     pathname.startsWith(`${href}/`)
//   );
// }

// interface CollapsibleNavItemProps {
//   item: NavGroupItem;
//   pathname: string;
//   onNavigate: () => void;
// }

// function CollapsibleNavItem({
//   item,
//   pathname,
//   onNavigate,
// }: CollapsibleNavItemProps) {
//   const isGroupActive = item.items.some((subItem) =>
//     isPathActive(
//       pathname,
//       subItem.href,
//       subItem.exact,
//     ),
//   );

//   const [isOpen, setIsOpen] = useState(isGroupActive);
//   const [prevIsGroupActive, setPrevIsGroupActive] = useState(isGroupActive);

//   // Sync state inline during render instead of in useEffect
//   if (isGroupActive !== prevIsGroupActive) {
//     setPrevIsGroupActive(isGroupActive);
//     if (isGroupActive) {
//       setIsOpen(true);
//     }
//   }

//   const Icon = item.icon;

//   return (
//     <Collapsible
//       open={isOpen}
//       onOpenChange={setIsOpen}
//     >
//       <SidebarMenuItem>
//         <CollapsibleTrigger
//           render={
//             <SidebarMenuButton
//               isActive={isGroupActive}
//               tooltip={item.title}
//             />
//           }
//         >
//           <Icon />
//           <span>{item.title}</span>

//           <ChevronRight
//             className={[
//               "ml-auto size-4 shrink-0",
//               "transform-gpu transition-transform",
//               "duration-300 ease-in-out",
//               isOpen ? "rotate-90" : "rotate-0",
//             ].join(" ")}
//           />
//         </CollapsibleTrigger>

//         <CollapsibleContent>
//           <SidebarMenuSub>
//             {item.items.map((subItem) => {
//               const isActive = isPathActive(
//                 pathname,
//                 subItem.href,
//                 subItem.exact,
//               );

//               return (
//                 <SidebarMenuSubItem
//                   key={subItem.href}
//                 >
//                   <SidebarMenuSubButton
//                     render={
//                       <Link
//                         href={subItem.href}
//                         onClick={onNavigate}
//                       />
//                     }
//                     isActive={isActive}
//                   >
//                     <span>{subItem.title}</span>
//                   </SidebarMenuSubButton>
//                 </SidebarMenuSubItem>
//               );
//             })}
//           </SidebarMenuSub>
//         </CollapsibleContent>
//       </SidebarMenuItem>
//     </Collapsible>
//   );
// }

// interface NavigationItemProps {
//   item: NavItem;
//   pathname: string;
//   onNavigate: () => void;
// }

// function NavigationItem({
//   item,
//   pathname,
//   onNavigate,
// }: NavigationItemProps) {
//   if (isNavGroupItem(item)) {
//     return (
//       <CollapsibleNavItem
//         item={item}
//         pathname={pathname}
//         onNavigate={onNavigate}
//       />
//     );
//   }

//   const Icon = item.icon;

//   const isActive = isPathActive(
//     pathname,
//     item.href,
//     item.exact,
//   );

//   return (
//     <SidebarMenuItem>
//       <SidebarMenuButton
//         render={
//           <Link
//             href={item.href}
//             onClick={onNavigate}
//           />
//         }
//         isActive={isActive}
//         tooltip={item.title}
//       >
//         <Icon />
//         <span>{item.title}</span>
//       </SidebarMenuButton>
//     </SidebarMenuItem>
//   );
// }

// export function AdminSidebar({
//   user,
//   ...props
// }: AdminSidebarProps) {
//   const pathname = usePathname();
//   const { isMobile, setOpenMobile } =
//     useSidebar();

//   const handleNavigation = () => {
//     if (isMobile) {
//       setOpenMobile(false);
//     }
//   };

//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton
//               size="lg"
//               render={
//                 <Link
//                   href="/admin"
//                   onClick={handleNavigation}
//                 />
//               }
//             >
//               <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
//                 <Building2 className="size-4" />
//               </div>

//               <div className="grid flex-1 text-left text-sm leading-tight">
//                 <span className="truncate font-semibold">
//                   EMS
//                 </span>

//                 <span className="truncate text-xs">
//                   Admin Console
//                 </span>
//               </div>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>

//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>
//             Application
//           </SidebarGroupLabel>

//           <SidebarGroupContent>
//             <SidebarMenu>
//               {adminNavigation.map((item) => (
//                 <NavigationItem
//                   key={item.title}
//                   item={item}
//                   pathname={pathname}
//                   onNavigate={handleNavigation}
//                 />
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter>
//         <SidebarUserMenu user={user} />
//       </SidebarFooter>

//       <SidebarRail />
//     </Sidebar>
//   );
// }

















"use client";

import { useState, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import { SidebarUserMenu } from "@/components/shared/sidebar-user-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { AuthUser } from "@/features/auth/types/auth.types";

interface AdminSidebarProps extends ComponentProps<typeof Sidebar> {
  user: AuthUser;
}

interface NavLinkItem {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  items?: never;
}

interface NavSubItem {
  title: string;
  href: string;
  exact?: boolean;
}

interface NavGroupItem {
  title: string;
  icon: LucideIcon;
  items: NavSubItem[];
  href?: never;
  exact?: never;
}

type NavItem = NavLinkItem | NavGroupItem;

interface NavSection {
  label: string;
  items: NavItem[];
}

const adminNavigation: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        title: "Employees",
        href: "/admin/employees",
        icon: Users,
      },
      {
        title: "Departments",
        href: "/admin/departments",
        icon: Building2,
      },
      {
        title: "Documents",
        href: "/admin/documents",
        icon: FileText,
      },
    ],
  },
  {
    label: "Daily operations",
    items: [
      {
        title: "Attendance",
        href: "/admin/attendance",
        icon: CalendarCheck,
      },
      {
        title: "Employee Requests",
        icon: MessageSquareWarning,
        items: [
          {
            title: "All Requests",
            href: "/admin/requests",
            exact: true,
          },
          {
            title: "Categories",
            href: "/admin/requests/categories",
          },
        ],
      },
      {
        title: "Leaves",
        icon: CalendarDays,
        items: [
          {
            title: "Leave Requests",
            href: "/admin/leaves/requests",
          },
          {
            title: "Leave Types",
            href: "/admin/leaves/types",
            exact: true,
          },
          {
            title: "Balances",
            href: "/admin/leaves/balance",
          },
        ],
      },
      {
        title: "Resources",
        href: "/admin/resources",
        icon: Boxes,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        title: "Announcements",
        href: "/admin/announcements",
        icon: Megaphone,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Office Settings",
        icon: Settings,
        items: [
          {
            title: "General",
            href: "/admin/office/settings",
            exact: true,
          },
          {
            title: "Holidays Calendar",
            href: "/admin/office/holidays-calendar",
          },
        ],
      },
    ],
  },
];

function isNavGroupItem(item: NavItem): item is NavGroupItem {
  return Array.isArray(item.items);
}

function isPathActive(
  pathname: string,
  href: string,
  exact = false,
): boolean {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

interface CollapsibleNavItemProps {
  item: NavGroupItem;
  pathname: string;
  onNavigate: () => void;
}

function CollapsibleNavItem({
  item,
  pathname,
  onNavigate,
}: CollapsibleNavItemProps) {
  const { state, isMobile, setOpen } = useSidebar();

  const isGroupActive = item.items.some((subItem) =>
    isPathActive(pathname, subItem.href, subItem.exact),
  );

  // A manual choice applies to the current route. After navigation,
  // the group containing the new route opens automatically.
  const [manualOpen, setManualOpen] = useState<{
    pathname: string;
    open: boolean;
  } | null>(null);

  const isOpen =
    manualOpen?.pathname === pathname
      ? manualOpen.open
      : isGroupActive;

  const Icon = item.icon;

  const handleOpenChange = (open: boolean) => {
    if (!isMobile && state === "collapsed") {
      setOpen(true);
      setManualOpen({ pathname, open: true });
      return;
    }

    setManualOpen({ pathname, open });
  };

  return (
    <SidebarMenuItem>
      <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              isActive={isGroupActive}
              tooltip={item.title}
            />
          }
        >
          <Icon />
          <span>{item.title}</span>
          <ChevronRight
            className={[
              "ml-auto size-4 shrink-0",
              "transition-transform duration-200",
              isOpen ? "rotate-90" : "",
            ].join(" ")}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const isActive = isPathActive(
                pathname,
                subItem.href,
                subItem.exact,
              );

              return (
                <SidebarMenuSubItem key={subItem.href}>
                  <SidebarMenuSubButton
                    render={
                      <Link
                        href={subItem.href}
                        onClick={onNavigate}
                        aria-current={
                          isActive ? "page" : undefined
                        }
                      />
                    }
                    isActive={isActive}
                  >
                    <span>{subItem.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

interface NavigationItemProps {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}

function NavigationItem({
  item,
  pathname,
  onNavigate,
}: NavigationItemProps) {
  if (isNavGroupItem(item)) {
    return (
      <CollapsibleNavItem
        item={item}
        pathname={pathname}
        onNavigate={onNavigate}
      />
    );
  }

  const Icon = item.icon;
  const isActive = isPathActive(
    pathname,
    item.href,
    item.exact,
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
          />
        }
        isActive={isActive}
        tooltip={item.title}
      >
        <Icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminSidebar({
  user,
  ...props
}: AdminSidebarProps) {
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
              render={
                <Link
                  href="/admin"
                  onClick={handleNavigation}
                />
              }
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  EMS
                </span>
                <span className="truncate text-xs">
                  Admin Console
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent
        className="admin-sidebar-content"
        role="navigation"
        aria-label="Admin menu"
        tabIndex={0}>
        {adminNavigation.map((section) => (
          <SidebarGroup key={section.label} className="py-1">
            <SidebarGroupLabel className="text-xs font-semibold">
              {section.label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <NavigationItem
                    key={item.title}
                    item={item}
                    pathname={pathname}
                    onNavigate={handleNavigation}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserMenu user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}