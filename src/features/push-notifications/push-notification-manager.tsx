"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { requestKeys } from "@/features/employee-requests/hooks/use-employee-requests";
import { useAuthStore } from "@/stores/auth.store";
import {
  enablePushNotifications,
  isPushAvailable,
  listenForForegroundMessages,
  unlockNotificationSound,
} from "./push-notifications";

const PROMPTED_KEY = "ems-notification-permission-prompted";

export function PushNotificationManager() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unlock = () => unlockNotificationSound();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "default" ||
      !isPushAvailable() ||
      localStorage.getItem(PROMPTED_KEY)
    ) {
      return;
    }

    localStorage.setItem(PROMPTED_KEY, "true");
    const promptTimer = window.setTimeout(() => {
      void Notification.requestPermission().then((permission) => {
        if (permission === "granted" && useAuthStore.getState().isAuthenticated) {
          void enablePushNotifications(false).catch(() => undefined);
        }
      });
    }, 800);
    return () => window.clearTimeout(promptTimer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      void enablePushNotifications(false).catch(() => undefined);
    }

    let unsubscribe: (() => void) | undefined;
    void listenForForegroundMessages((payload) => {
      if (payload.data?.employeeRequestId) {
        void queryClient.invalidateQueries({ queryKey: requestKeys.all });
      }
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }).then((listener) => { unsubscribe = listener; });
    return () => {
      unsubscribe?.();
    };
  }, [isAuthenticated, queryClient]);
  return null;
}
