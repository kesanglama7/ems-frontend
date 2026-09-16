"use client";
import { create } from "zustand";
interface PushSettings {
  ready: boolean;
  supported: boolean;
  permission: NotificationPermission;
  enabled: boolean;
  registered: boolean;
  pending: boolean;
  sound: boolean;
  error: string | null;
}
export const usePushSettings = create<PushSettings>(() => ({ ready: false, supported: false, permission: "default", enabled: true, registered: false, pending: false, sound: true, error: null }));
export const PUSH_ENABLED_KEY = "ems-push-enabled";
export const SOUND_KEY = "ems-notification-sound";
export function setNotificationSound(sound: boolean) {
  localStorage.setItem(SOUND_KEY, String(sound));
  usePushSettings.setState({ sound });
}
