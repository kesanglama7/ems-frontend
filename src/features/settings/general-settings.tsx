'use client';

import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setNotificationSound, usePushSettings } from "../push-notifications/push-settings.store";
import { disablePushNotifications, enablePushNotifications, unlockNotificationSound } from "../push-notifications/push-notifications";

export default function GeneralSettings() {
  const state = usePushSettings();
  const active =
    state.registered && state.enabled && state.permission === "granted";

  async function handleNotificationToggle(checked: boolean) {
    unlockNotificationSound();
    usePushSettings.setState({ pending: true, error: null });

    try {
      if (checked) {
        await enablePushNotifications();
        toast.success("Push notifications enabled on this device.");
      } else {
        await disablePushNotifications();
        toast.success("Push notifications disabled on this device.");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update notification settings.";
      usePushSettings.setState({ error: message });
      toast.error(message);
    } finally {
      usePushSettings.setState({ pending: false });
    }
  }

  function handleSoundToggle(checked: boolean) {
    unlockNotificationSound();
    setNotificationSound(checked);
  }

  const isPushDisabled =
    !state.ready ||
    !state.supported ||
    state.pending ||
    state.permission === "denied";

  const getStatusMessage = () => {
    if (!state.ready) return "Checking browser compatibility…";
    if (!state.supported) return "Notifications are unsupported in this browser.";
    if (state.permission === "denied")
      return "Blocked in browser settings. Allow notifications in your browser address bar.";
    return null;
  };

  const statusMessage = state.error ?? getStatusMessage();

  return (
    <section className="mx-auto flex w-full flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            General Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your general preferences and settings.
          </p>
        </div>
      </div>

      {/* Notifications Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
        <div>
          <h2 className="text-base font-semibold">Notifications</h2>
          <p className="text-xs text-muted-foreground">
            Manage device alerts and sound settings.
          </p>
        </div>
        <hr className="border-t" />
        <div className="space-y-4">
          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="push-notifications" className="text-sm font-medium">
                Push Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive browser notifications on this device.
              </p>
              {statusMessage && (
                <p className="text-xs text-destructive">{statusMessage}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {state.pending && (
                <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                id="push-notifications"
                checked={active}
                disabled={isPushDisabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </div>

          {/* Notification Sound Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="notification-sound" className="text-sm font-medium">
                Notification Sound
              </Label>
              <p className="text-xs text-muted-foreground">
                Play an in-app sound when a new notification arrives.
              </p>
            </div>
            <Switch
              id="notification-sound"
              checked={state.sound}
              onCheckedChange={handleSoundToggle}
            />
          </div>
        </div>
      </div>
    </section>
  );
}