"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";

import { useMe } from "../hooks/use-me";
import { LoginForm } from "./login-form";

function LoginLoadingState() {
  return (
    <div className="w-full max-w-md space-y-4 rounded-xl border p-6">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function LoginPageContent() {
  const router = useRouter();
  const { data: user, isLoading, isSuccess } = useMe();
  const redirected = useRef(false);

  useEffect(() => {
    if (!isSuccess || !user || redirected.current) {
      return;
    }

    redirected.current = true;
    const openNotifications = sessionStorage.getItem("ems-open-notifications-after-login") === "true";
    sessionStorage.removeItem("ems-open-notifications-after-login");
    const home = user.role === "ADMIN" ? "/admin" : "/employee";
    router.replace(openNotifications ? `${home}/notifications` : home);
  }, [isSuccess, router, user]);

  if (isLoading || isSuccess) {
    return <LoginLoadingState />;
  }

  return <LoginForm />;
}
