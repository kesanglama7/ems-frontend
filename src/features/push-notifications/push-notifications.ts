"use client";
import { deleteToken, getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { getFirebaseMessaging, isFirebaseConfigured } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth.store";
import { registerPushDevice, unregisterPushDevice } from "./push-notifications.api";
import { PUSH_ENABLED_KEY, usePushSettings } from "./push-settings.store";
const TOKEN_KEY = "ems-fcm-token";
let audioContext: AudioContext | null = null;
let registrationPromise: Promise<string> | null = null;
let registrationSession: string | null = null;
export function currentPushSession() {
  const state = useAuthStore.getState();
  if (!state.isAuthenticated || !state.user || !state.accessToken) return null;
  try {
    const payload = JSON.parse(atob(state.accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return `${state.user.id}:${payload.sid ?? ""}`;
  } catch { return state.user.id; }
}
export function isPushAvailable() {
  return typeof window !== "undefined" && window.isSecureContext && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window && isFirebaseConfigured();
}
export function unlockNotificationSound() {
  try {
    if (typeof window === "undefined" || !window.AudioContext) return;
    audioContext ??= new window.AudioContext();
    if (audioContext.state === "suspended") void audioContext.resume().catch(() => undefined);
  } catch { /* Audio can be unavailable in browser privacy modes. */ }
}
export function playNotificationSound() {
  if (!usePushSettings.getState().sound) return;
  try {
    if (!audioContext || audioContext.state !== "running") return;
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    gain.connect(audioContext.destination);
    [659.25, 880].forEach((frequency, i) => {
      const oscillator = audioContext!.createOscillator();
      oscillator.type = "sine"; oscillator.frequency.value = frequency; oscillator.connect(gain);
      oscillator.start(now + i * 0.1); oscillator.stop(now + 0.3 + i * 0.1);
    });
    window.setTimeout(() => gain.disconnect(), 600);
  } catch { /* Sound requires a previous user gesture. */ }
}
async function registerCurrentSession(session: string) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) throw new Error("Browser notifications are unavailable on this device.");
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  await navigator.serviceWorker.ready;
  const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!, serviceWorkerRegistration: registration });
  if (!token) throw new Error("Couldn’t register this device. Please try again.");
  if (currentPushSession() !== session || !usePushSettings.getState().enabled) throw new Error("Your notification settings changed. Please try again.");
  await registerPushDevice(token);
  localStorage.setItem(TOKEN_KEY, token);
  if (currentPushSession() !== session || !usePushSettings.getState().enabled) {
    // Logout revokes server tokens; avoid treating the old registration as active.
    throw new Error("Your session changed. Please try again.");
  }
  usePushSettings.setState({ registered: true, error: null });
  return token;
}
export async function enablePushNotifications(requestPermission = true) {
  if (!isPushAvailable()) throw new Error("Browser notifications need HTTPS, a supported browser, and Firebase configuration.");
  const session = currentPushSession();
  if (!session) throw new Error("Sign in to enable notifications.");
  // Invoke this before awaiting anything so the browser receives a user gesture.
  const permission = requestPermission ? await Notification.requestPermission() : Notification.permission;
  usePushSettings.setState({ permission });
  if (permission !== "granted") throw new Error(permission === "denied" ? "Notifications are blocked. Allow them in your browser’s site settings." : "Notification permission wasn’t granted.");
  if (requestPermission) {
    localStorage.setItem(PUSH_ENABLED_KEY, "true");
    usePushSettings.setState({ enabled: true });
  }
  if (!usePushSettings.getState().enabled) throw new Error("Notifications are disabled on this device.");
  if (registrationPromise) {
    if (registrationSession === session) return registrationPromise;
    await registrationPromise.catch(() => undefined);
    return enablePushNotifications(false);
  }
  registrationSession = session;
  registrationPromise = registerCurrentSession(session).finally(() => { registrationPromise = null; registrationSession = null; });
  return registrationPromise;
}
export async function disablePushNotifications() {
  localStorage.setItem(PUSH_ENABLED_KEY, "false");
  usePushSettings.setState({ enabled: false });
  try {
    if (registrationPromise) await registrationPromise.catch(() => undefined);
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) await unregisterPushDevice(token);
    usePushSettings.setState({ registered: false });
    localStorage.removeItem(TOKEN_KEY);
    const messaging = await getFirebaseMessaging();
    if (messaging) await deleteToken(messaging);
  } catch (error) {
    // Keep disabled preference; surface an error if the server could not unregister.
    throw error;
  }
}
export async function unregisterCurrentPushDevice() {
  if (registrationPromise) await registrationPromise.catch(() => undefined);
  const token = localStorage.getItem(TOKEN_KEY);
  try { if (token) await unregisterPushDevice(token); }
  finally {
    localStorage.removeItem(TOKEN_KEY);
    usePushSettings.setState({ registered: false });
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      const notifications = await registration?.getNotifications();
      notifications?.forEach((notification) => notification.close());
    }
  }
}
export async function listenForForegroundMessages(onNotification: (payload: MessagePayload) => void) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => undefined;
  return onMessage(messaging, onNotification);
}
