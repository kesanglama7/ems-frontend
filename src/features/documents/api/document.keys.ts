import type { AdminDocumentListFilters } from "../types/document.types";

export const documentKeys = {
  all: ["documents"] as const,

  /**
   * Employee documents
   */
  lists: () =>
    [...documentKeys.all, "list"] as const,

  list: () =>
    [...documentKeys.lists(), "mine"] as const,

  details: () =>
    [...documentKeys.all, "detail"] as const,

  detail: (documentId: string) =>
    [
      ...documentKeys.details(),
      documentId,
    ] as const,

  /**
   * Admin documents
   */
  admin: () =>
    [...documentKeys.all, "admin"] as const,

  adminLists: () =>
    [
      ...documentKeys.admin(),
      "list",
    ] as const,

  adminList: (
    filters: AdminDocumentListFilters = {},
  ) =>
    [
      ...documentKeys.adminLists(),
      filters,
    ] as const,

  adminDetails: () =>
    [
      ...documentKeys.admin(),
      "detail",
    ] as const,

  adminDetail: (documentId: string) =>
    [
      ...documentKeys.adminDetails(),
      documentId,
    ] as const,
};