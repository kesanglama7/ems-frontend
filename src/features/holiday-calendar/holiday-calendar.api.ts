import { api } from "@/lib/api";
import type { Holiday, Result } from "./types";
import type { HolidayFormValues } from "./schema";

export async function getHolidays(year: number, signal?: AbortSignal) {
  const response = await api.get<Result<Holiday[]>>(
    `/office-holidays?year=${year}`,
    { signal },
  );
  return response.data;
}

export async function saveHoliday(values: HolidayFormValues, id?: string) {
  return id
    ? api.patch(`/office-holidays/${id}`, values)
    : api.post("/office-holidays", values);
}

export async function deleteHoliday(id: string) {
  return api.delete(`/office-holidays/${id}`);
}
