import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOfficeSettings, updateOfficeSettings } from "../api/office-settings.api";
import { toast } from "sonner";

export const OFFICE_SETTINGS_QUERY_KEY = ["office-settings"];

export function useOfficeSettings() {
  return useQuery({
    queryKey: OFFICE_SETTINGS_QUERY_KEY,
    queryFn: getOfficeSettings,
  });
}

export function useUpdateOfficeSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOfficeSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFICE_SETTINGS_QUERY_KEY });
      toast.success("Office settings updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update office settings.");
    },
  });
}
