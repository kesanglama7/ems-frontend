"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  KeyRound,
  LogOut,
  UserRound,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
import { useLogout } from "@/features/auth/hooks/use-logout";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { useMyEmployeeProfile } from "@/features/employees/hooks/use-my-employee-profile";

interface SidebarUserMenuProps {
  user: AuthUser;
}

function getInitials(email: string) {
  return email
    .slice(0, 2)
    .toUpperCase();
}

export function SidebarUserMenu({
  user,
}: SidebarUserMenuProps) {
  const router = useRouter();

  const {
    isMobile,
    setOpenMobile,
  } = useSidebar();

  const { data: profile } = useMyEmployeeProfile();

  const logoutMutation =
    useLogout();

  const [
    isChangePasswordOpen,
    setIsChangePasswordOpen,
  ] = useState(false);

  const handleProfileNavigation =
    () => {
      if (isMobile) {
        setOpenMobile(false);
      }

      router.push(
        "/employee/profile",
      );
    };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                />
              }
            >
              <Avatar className="size-8 rounded-lg">
                {profile?.profileImageUrl && (
                  <AvatarImage
                    src={profile.profileImageUrl}
                    alt={
                      `${profile.firstName} ${profile.lastName}`
                    }
                  />
                )}
                <AvatarFallback className="rounded-lg">
                  {getInitials(
                    user.email,
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {profile?.firstName} {profile?.lastName}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="min-w-56 rounded-lg"
              side={
                isMobile
                  ? "bottom"
                  : "right"
              }
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <Avatar className="size-8 rounded-lg">
                      {profile?.profileImageUrl && (
                        <AvatarImage
                          src={profile.profileImageUrl}
                          alt={
                            `${profile.firstName} ${profile.lastName}`
                          }
                        />
                      )}
                      <AvatarFallback className="rounded-lg">
                        {getInitials(
                          user.email,
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {profile?.firstName} {profile?.lastName}
                      </span>

                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                {user.role ===
                  "EMPLOYEE" && (
                  <DropdownMenuItem
                    onClick={
                      handleProfileNavigation
                    }
                  >
                    <UserRound />
                    Profile
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() =>
                    setIsChangePasswordOpen(
                      true,
                    )
                  }
                >
                  <KeyRound />
                  Change password
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  disabled={
                    logoutMutation.isPending
                  }
                  onClick={() =>
                    logoutMutation.mutate()
                  }
                >
                  <LogOut />

                  {logoutMutation.isPending
                    ? "Signing out..."
                    : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ChangePasswordDialog
        open={
          isChangePasswordOpen
        }
        onOpenChange={
          setIsChangePasswordOpen
        }
      />
    </>
  );
}
