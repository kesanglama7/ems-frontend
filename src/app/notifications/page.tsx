"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLoading } from "@/components/shared/app-loading";
import { useAuthStore } from "@/stores/auth.store";
export default function NotificationLanding() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hasHydrated);
  const user = useAuthStore((s) => s.user);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (!hydrated) return;
    if (!authenticated || !user) {
      sessionStorage.setItem("ems-open-notifications-after-login", "true");
      router.replace("/login");
    } else router.replace(user.role === "ADMIN" ? "/admin/notifications" : "/employee/notifications");
  }, [hydrated, authenticated, user, router]);
  return <AppLoading message="Opening notifications…" />;
}
