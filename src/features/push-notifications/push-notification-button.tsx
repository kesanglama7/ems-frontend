"use client";
import { Bell, BellOff, LoaderCircle, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    disablePushNotifications,
    enablePushNotifications,
    unlockNotificationSound,
} from "./push-notifications";
import { setNotificationSound, usePushSettings } from "./push-settings.store";
export function PushNotificationButton() {
    const state = usePushSettings();
    const active =
        state.registered && state.enabled && state.permission === "granted";
    async function toggle() {
        unlockNotificationSound();
        usePushSettings.setState({ pending: true, error: null });
        try {
            if (active || (!state.enabled && state.registered)) {
                await disablePushNotifications();
                toast.success("Browser notifications disabled on this device.");
            } else {
                await enablePushNotifications();
                toast.success("Browser notifications enabled on this device.");
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Couldn’t update browser notifications.";
            usePushSettings.setState({ error: message });
            toast.error(message);
        } finally {
            usePushSettings.setState({ pending: false });
        }
    }
    const status = !state.ready
        ? "Checking browser…"
        : !state.supported
          ? "Unavailable in this browser or configuration"
          : state.permission === "denied"
            ? "Blocked in browser settings"
            : active
              ? "Enabled on this device"
              : "Disabled on this device";
    return (
        <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant={active ? "secondary" : "outline"}
                    size="sm"
                    disabled={
                        !state.ready ||
                        !state.supported ||
                        state.pending ||
                        state.permission === "denied"
                    }
                    onClick={() => void toggle()}
                >
                    {state.pending ? (
                        <LoaderCircle className="animate-spin" />
                    ) : active ? (
                        <Bell />
                    ) : (
                        <BellOff />
                    )}
                    {state.pending
                        ? "Updating…"
                        : active
                          ? "Disable notifications"
                          : "Enable notifications"}
                </Button>
                <Button
                    size="icon-sm"
                    variant="ghost"
                    title={
                        state.sound
                            ? "Mute in-app notification sound"
                            : "Enable in-app notification sound"
                    }
                    aria-label={
                        state.sound
                            ? "Mute in-app notification sound"
                            : "Enable in-app notification sound"
                    }
                    aria-pressed={state.sound}
                    onClick={() => {
                        unlockNotificationSound();
                        setNotificationSound(!state.sound);
                    }}
                >
                    {state.sound ? <Volume2 /> : <VolumeX />}
                </Button>
            </div>
            <p
                role="status"
                className="max-w-sm text-xs leading-5 text-muted-foreground"
            >
                {state.error ?? status}
                {state.permission === "denied" &&
                    " · Allow notifications using the site settings beside your address bar."}
            </p>
        </div>
    );
}
