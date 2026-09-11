import { api } from "@/lib/api";

export async function registerPushDevice(token: string) {
  return (await api.post("/push-notifications/devices", { token, platform: "WEB" })).data;
}

export async function unregisterPushDevice(token: string) {
  return (await api.delete("/push-notifications/devices", { data: { token } })).data;
}
