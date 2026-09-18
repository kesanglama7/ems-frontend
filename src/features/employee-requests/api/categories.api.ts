import { api } from "@/lib/api";
import type {
  CategoryFormValues,
  ManagedCategory,
} from "../types/categories.types";

export async function getRequestCategories(): Promise<ManagedCategory[]> {
  const response = await api.get<
    ManagedCategory[] | { data: ManagedCategory[] }
  >("/request-categories");

  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  throw new Error("Unexpected request categories response format");
}

export async function createRequestCategory(
  values: CategoryFormValues,
): Promise<void> {
  await api.post("/request-categories", values);
}

export async function updateRequestCategory(
  id: string,
  values: CategoryFormValues,
): Promise<void> {
  await api.patch(`/request-categories/${id}`, values);
}

export async function deactivateRequestCategory(
  id: string,
): Promise<void> {
  await api.delete(`/request-categories/${id}`);
}

export async function reactivateRequestCategory(
  id: string,
): Promise<void> {
  await api.patch(`/request-categories/${id}`, {
    isActive: true,
  });
}