"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!isSuccess || !user) {
      return;
    }

    router.replace(
      user.role === "ADMIN"
        ? "/admin"
        : "/employee",
    );
  }, [isSuccess, router, user]);

  if (isLoading || isSuccess) {
    return <LoginLoadingState />;
  }

  return <LoginForm />;
}
