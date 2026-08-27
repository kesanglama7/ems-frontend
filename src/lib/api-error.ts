import axios from "axios";

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please try again.";

export function getApiErrorMessage(
  error: unknown,
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error instanceof Error) {
      return error.message;
    }

    return DEFAULT_ERROR_MESSAGE;
  }

  const response = error.response?.data;

  if (Array.isArray(response?.message)) {
    return response.message.join(", ");
  }

  if (
    typeof response?.message === "string" &&
    response.message.trim()
  ) {
    return response.message;
  }

  if (
    typeof response?.error === "string" &&
    response.error.trim()
  ) {
    return response.error;
  }

  if (error.message) {
    return error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
}