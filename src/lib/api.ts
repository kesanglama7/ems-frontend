import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL environment variable is not defined.",
  );
}

const API_BASE_URL = API_URL.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

type RetryableRequestConfig =
  InternalAxiosRequestConfig & {
    _retry?: boolean;
  };
let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      )
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401
    ) {
      return Promise.reject(error);
    }
    if (
      originalRequest.url?.includes(
        "/auth/login",
      )
    ) {
      return Promise.reject(error);
    }
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
      await refreshSession();
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);