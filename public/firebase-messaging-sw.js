/* Firebase web configuration is public metadata, not a service-account secret. */
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB0fy3v8pXQ0BZfjRHh9YZ75jT3vWI7ZFs",
  authDomain: "office-management-system-c8991.firebaseapp.com",
  projectId: "office-management-system-c8991",
  storageBucket: "office-management-system-c8991.firebasestorage.app",
  messagingSenderId: "795710715851",
  appId: "1:795710715851:web:9e633c975fe5e2a5b5e84e",
});

firebase.messaging();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const payload = event.notification.data?.FCM_MSG?.data ?? event.notification.data ?? {};
  const targetUrl = payload.employeeRequestId
    ? payload.type === "EMPLOYEE_REQUEST_STATUS_CHANGED"
      ? "/employee/requests"
      : "/admin/requests"
    : "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existingWindow = windows.find((client) => "focus" in client);
      if (existingWindow) {
        if ("navigate" in existingWindow) return existingWindow.navigate(targetUrl).then(() => existingWindow.focus());
        return existingWindow.focus();
      }
      return clients.openWindow(targetUrl);
    }),
  );
});
