"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppLoading } from "@/components/shared/app-loading";

import { useMe } from "../hooks/use-me";
import type { UserRole } from "../types/auth.types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

function getRoleHome(role: UserRole) {
  return role === "ADMIN" ? "/admin" : "/employee";
}

export function AuthGuard({
  children,
  allowedRole,
}: AuthGuardProps) {
  const router = useRouter();
  const {
    data: user,
    isLoading,
    isError,
  } = useMe();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isError || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== allowedRole) {
      router.replace(getRoleHome(user.role));
    }
  }, [
    allowedRole,
    isError,
    isLoading,
    router,
    user,
  ]);

  if (isLoading) {
    return (
      <AppLoading message="Checking your session..." />
    );
  }

  if (isError || !user) {
    return (
      <AppLoading message="Redirecting to sign in..." />
    );
  }

  if (user.role !== allowedRole) {
    return (
      <AppLoading message="Redirecting..." />
    );
  }

  return <>{children}</>;
}
