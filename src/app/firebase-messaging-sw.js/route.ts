// Only NEXT_PUBLIC Firebase metadata is serialized into this public service worker.
export const dynamic = "force-dynamic";
export function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const script = `
// Install the custom handler before Firebase so its default handler cannot override it.
self.addEventListener("notificationclick", (event) => {
  event.stopImmediatePropagation();
  event.notification.close();
  const payload = event.notification.data || {};
  const data = payload.FCM_MSG?.data || payload;
  const announcementId = data.entityType === "ANNOUNCEMENT" ? data.announcementId || data.entityId : null;
  const target = new URL(
    announcementId && /^[a-zA-Z0-9-]{36}$/.test(announcementId)
      ? "/employee/announcements/" + encodeURIComponent(announcementId)
      : "/notifications",
    self.location.origin
  ).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windows) => {
    const existing = windows.find((client) => new URL(client.url).origin === self.location.origin && "focus" in client);
    if (existing) {
      const navigated = await existing.navigate(target);
      return (navigated || existing).focus();
    }
    return clients.openWindow(target);
  }));
});
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");
firebase.initializeApp(${JSON.stringify(config)});
firebase.messaging();
// FCM displays background notification payloads automatically. Do not display a second copy.
`;
  return new Response(script, { headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "no-cache, no-store, must-revalidate", "Service-Worker-Allowed": "/", "X-Content-Type-Options": "nosniff" } });
}
