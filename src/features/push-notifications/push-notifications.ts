"use client";

import { deleteToken, getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { toast } from "sonner";
import { getFirebaseMessaging } from "@/lib/firebase";
import { registerPushDevice, unregisterPushDevice } from "./push-notifications.api";

const TOKEN_KEY = "ems-fcm-token";
let audioContext: AudioContext | null = null;

export function isPushAvailable() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function unlockNotificationSound() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext;
  audioContext ??= new AudioContextClass();
  if (audioContext.state === "suspended") void audioContext.resume();
}

function playNotificationSound() {
  try {
    unlockNotificationSound();
    if (!audioContext || audioContext.state !== "running") return;
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    gain.connect(audioContext.destination);

    [659.25, 880].forEach((frequency, index) => {
      const oscillator = audioContext!.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(now + index * 0.12);
      oscillator.stop(now + 0.34 + index * 0.12);
    });
  } catch {
    // Browsers may suppress audio until the page receives a user interaction.
  }
}

export async function enablePushNotifications(requestPermission = true) {
  if (!isPushAvailable()) throw new Error("Push notifications are not supported in this browser.");
  const permission = requestPermission ? await Notification.requestPermission() : Notification.permission;
  if (permission !== "granted") throw new Error("Notification permission was not granted.");
  const messaging = await getFirebaseMessaging();
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!messaging || !vapidKey) throw new Error("Firebase messaging is not configured.");
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error("Firebase did not return a device token.");
  await registerPushDevice(token);
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

export async function disablePushNotifications() {
  const token = localStorage.getItem(TOKEN_KEY);
  const messaging = await getFirebaseMessaging();
  if (token) await unregisterPushDevice(token);
  if (messaging) await deleteToken(messaging);
  localStorage.removeItem(TOKEN_KEY);
}

export async function unregisterCurrentPushDevice() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;
  try { await unregisterPushDevice(token); } finally { localStorage.removeItem(TOKEN_KEY); }
}

export async function listenForForegroundMessages(
  onNotification?: (payload: MessagePayload) => void,
) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => undefined;
  return onMessage(messaging, (payload) => {
    onNotification?.(payload);
    playNotificationSound();
    toast(payload.notification?.title ?? "New notification", {
      description: payload.notification?.body,
      duration: 15_000,
    });
  });
}
