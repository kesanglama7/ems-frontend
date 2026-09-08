import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import type { AuthSession } from "@/features/auth/types/auth.types";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types/api.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not defined.");
}

const API_BASE_URL = API_URL.replace(/\/+$/, "");

export const api = axios.create({ baseURL: API_BASE_URL });

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<AuthSession> | null = null;

function clearAuthentication() {
  useAuthStore.getState().clearAuth();
}

async function refreshSession(): Promise<AuthSession> {
  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    clearAuthentication();
    throw new Error("No refresh token is available.");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiResponse<AuthSession>>(
        API_BASE_URL + "/auth/refresh",
        { refreshToken },
      )
      .then((response) => {
        const session = response.data.data;
        useAuthStore.getState().setSession(session);
        return session;
      })
      .catch((error) => {
        clearAuthentication();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = "Bearer " + accessToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const isAuthRequest =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh");

    if (isAuthRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const session = await refreshSession();
      originalRequest.headers.Authorization = "Bearer " + session.accessToken;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
