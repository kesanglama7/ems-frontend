"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { disablePushNotifications, enablePushNotifications, isPushAvailable } from "./push-notifications";

export function PushNotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isPushAvailable()) setPermission(Notification.permission);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function toggle() {
    setPending(true);
    try {
      if (permission === "granted") {
        await disablePushNotifications();
        toast.success("Push notifications disabled on this device.");
      } else {
        await enablePushNotifications();
        setPermission(Notification.permission);
        toast.success("Push notifications enabled.");
      }
    } catch (error) {
      setPermission(typeof Notification === "undefined" ? "denied" : Notification.permission);
      toast.error(error instanceof Error ? error.message : "Could not update notifications.");
    } finally { setPending(false); }
  }

  const enabled = permission === "granted";
  return (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="ghost" size="icon" className="ml-auto" onClick={toggle} disabled={pending || !isPushAvailable()} />}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : enabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
        <span className="sr-only">{enabled ? "Disable" : "Enable"} push notifications</span>
      </TooltipTrigger>
      <TooltipContent>{enabled ? "Push notifications enabled" : "Enable push notifications"}</TooltipContent>
    </Tooltip>
  );
}
