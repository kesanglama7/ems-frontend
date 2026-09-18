"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createRequestCategory,
  deactivateRequestCategory,
  getRequestCategories,
  reactivateRequestCategory,
  updateRequestCategory,
} from "../api/categories.api";
import type {
  ManagedCategory,
  SaveCategoryInput,
} from "../types/categories.types";

const categoriesKey = ["request-categories"] as const;
const employeeRequestsKey = ["employee-requests"] as const;

export function useRequestCategories() {
  return useQuery({
    queryKey: categoriesKey,
    queryFn: getRequestCategories,
  });
}

export function useSaveRequestCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: SaveCategoryInput) => {
      const values = {
        name: name.trim(),
        description: description.trim(),
      };

      if (id) {
        await updateRequestCategory(id, values);
      } else {
        await createRequestCategory(values);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: categoriesKey,
        }),
        queryClient.invalidateQueries({
          queryKey: employeeRequestsKey,
        }),
      ]);
    },
  });
}

export function useToggleRequestCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: ManagedCategory) => {
      if (category.isActive) {
        await deactivateRequestCategory(category.id);
      } else {
        await reactivateRequestCategory(category.id);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoriesKey,
      });
    },
  });
}