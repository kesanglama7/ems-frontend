"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { getNotifications } from "@/features/notifications/api";
import { notificationKeys } from "@/features/notifications/hooks";
import { notificationHref } from "@/features/notifications/notification-utils";
import type { NotificationCategory } from "@/features/notifications/types";
import { announcementKeys } from "@/features/announcements/hooks";
import { getFirebaseMessaging } from "@/lib/firebase";
import { enablePushNotifications, isPushAvailable, listenForForegroundMessages, playNotificationSound, unlockNotificationSound, currentPushSession } from "./push-notifications";
import { PUSH_ENABLED_KEY, SOUND_KEY, usePushSettings } from "./push-settings.store";
export function PushNotificationManager() {
  const userId = useAuthStore((s) => s.user?.id);
  const authenticated = useAuthStore((s) => s.isAuthenticated && s.hasHydrated);
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const router = useRouter();
  // Access-token refresh preserves sid; registration follows the login session.
  const session = authenticated && token ? currentPushSession() : null;
  useEffect(() => {
    const unlock = () => unlockNotificationSound();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => { window.removeEventListener("pointerdown", unlock); window.removeEventListener("keydown", unlock); };
  }, []);
  useEffect(() => {
    if (!session || !userId) {
      usePushSettings.setState({ registered: false });
      void qc.cancelQueries({ queryKey: notificationKeys.all }).then(() => qc.removeQueries({ queryKey: notificationKeys.all }));
      return;
    }
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    let refreshing = false;
    const seen = new Set<string>();
    async function refreshDevice() {
      if (disposed || refreshing || usePushSettings.getState().pending) return;
      refreshing = true;
      try {
        const supported = isPushAvailable() && Boolean(await getFirebaseMessaging());
        if (disposed) return;
        const permission = typeof Notification === "undefined" ? "default" : Notification.permission;
        const enabled = localStorage.getItem(PUSH_ENABLED_KEY) !== "false";
        usePushSettings.setState({ ready: true, supported, permission, enabled, sound: localStorage.getItem(SOUND_KEY) !== "false", ...(permission !== "granted" || !enabled ? { registered: false } : {}) });
        if (supported && permission === "granted" && enabled) await enablePushNotifications(false);
      } catch (error) {
        if (!disposed) usePushSettings.setState({ registered: false, error: error instanceof Error ? error.message : "Couldn’t register browser notifications." });
      } finally { refreshing = false; }
    }
    void refreshDevice();
    const onFocus = () => { void refreshDevice(); };
    const onStorage = () => { void refreshDevice(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    const refreshTimer = window.setInterval(onFocus, 12 * 60 * 60 * 1000);
    // Offer an in-app prompt after login. Native permission is requested on the action.
    const promptKey = `ems-notification-offer:${userId}`;
    const promptTimer = window.setTimeout(() => {
      if (disposed || !isPushAvailable() || Notification.permission !== "default" || localStorage.getItem(promptKey) || localStorage.getItem(PUSH_ENABLED_KEY) === "false") return;
      localStorage.setItem(promptKey, "true");
      toast("Stay up to date", { id: "notification-permission-offer", description: "Enable browser notifications for workplace updates.", duration: 10_000, action: { label: "Enable", onClick: () => {
        unlockNotificationSound();
        usePushSettings.setState({ pending: true });
        void enablePushNotifications().then(() => toast.success("Browser notifications enabled.")).catch((error) => toast.error(error instanceof Error ? error.message : "Couldn’t enable notifications.")).finally(() => usePushSettings.setState({ pending: false }));
      } } });
    }, 2000);
    void listenForForegroundMessages((payload) => {
      const id = payload.data?.notificationId;
      if (disposed || !id || seen.has(id) || !usePushSettings.getState().enabled || currentPushSession() !== session) return;
      seen.add(id);
      if (seen.size > 200) seen.delete(seen.values().next().value!);
      void qc.invalidateQueries({ queryKey: [...notificationKeys.all, userId] });
      const category = payload.data?.category;
      const invalidationKeys: Partial<Record<NotificationCategory, string>> = { REQUEST: "employee-requests", LEAVE: "leaves", DOCUMENT: "documents", ATTENDANCE: "attendance" };
      const key = category ? invalidationKeys[category as NotificationCategory] : undefined;
      if (key) void qc.invalidateQueries({ queryKey: [key] });
      if (category === "ANNOUNCEMENT") void qc.invalidateQueries({ queryKey: announcementKeys.employee });
      // Verify inbox ownership before displaying a foreground alert after account changes.
      void getNotifications().then(async (response) => {
        const item = response.data.find((n) => n.id === id && Date.parse(n.expiresAt) > Date.now());
        const user = useAuthStore.getState().user;
        if (!item || !user || disposed || currentPushSession() !== session) return;
        playNotificationSound();
        toast(item.title, { id, description: item.message, duration: 7000, action: { label: "View", onClick: () => router.push(notificationHref(item, user.role)) } });
        if (Notification.permission === "granted") {
          const registration = await navigator.serviceWorker.getRegistration();
          if (!disposed && currentPushSession() === session) await registration?.showNotification(item.title, { body: item.message, tag: id, data: { notificationId: id, entityType: item.entityType, entityId: item.entityId }, silent: true });
        }
      }).catch(() => undefined);
    }).then((listener) => { if (disposed) listener(); else unsubscribe = listener; }).catch(() => undefined);
    return () => {
      disposed = true; unsubscribe?.();
      window.clearTimeout(promptTimer); window.clearInterval(refreshTimer);
      window.removeEventListener("focus", onFocus); window.removeEventListener("storage", onStorage);
      toast.dismiss("notification-permission-offer");
    };
  }, [session, userId, qc, router]);
  return null;
}
