import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";

import type {
  AdminDocumentDetails,
  AdminDocumentListFilters,
  AdminDocumentListItem,
  DocumentFile,
  RejectDocumentInput,
  ReviewedAdminDocument,
  VerifyDocumentInput,
} from "../types/document.types";

/**
 * GET /admin/documents
 *
 * Returns employee documents visible to ADMIN users.
 *
 * Supported backend filters:
 * - employeeId
 * - status
 * - type
 */
export async function getAdminDocuments(
  filters: AdminDocumentListFilters = {},
): Promise<AdminDocumentListItem[]> {
  const response = await api.get<
    ApiResponse<AdminDocumentListItem[]>
  >("/admin/documents", {
    params: filters,
  });

  return response.data.data;
}

/**
 * GET /admin/documents/:documentId
 *
 * Returns detailed information for one
 * employee document.
 */
export async function getAdminDocument(
  documentId: string,
): Promise<AdminDocumentDetails> {
  const response = await api.get<
    ApiResponse<AdminDocumentDetails>
  >(`/admin/documents/${documentId}`);

  return response.data.data;
}

/**
 * GET /admin/documents/:documentId/file
 *
 * Returns a temporary signed URL used for
 * in-app document preview.
 *
 * Do not persist this URL in Zustand or
 * permanent application state.
 */
export async function getAdminDocumentFile(
  documentId: string,
): Promise<DocumentFile> {
  const response = await api.get<
    ApiResponse<DocumentFile>
  >(`/admin/documents/${documentId}/file`);

  return response.data.data;
}

/**
 * PATCH /admin/documents/:documentId/verify
 *
 * Verification note is optional.
 */
export async function verifyAdminDocument({
  documentId,
  input,
}: {
  documentId: string;
  input: VerifyDocumentInput;
}): Promise<ReviewedAdminDocument> {
  const response = await api.patch<
    ApiResponse<ReviewedAdminDocument>
  >(
    `/admin/documents/${documentId}/verify`,
    input,
  );

  return response.data.data;
}

/**
 * PATCH /admin/documents/:documentId/reject
 *
 * Rejection note is required by the backend.
 */
export async function rejectAdminDocument({
  documentId,
  input,
}: {
  documentId: string;
  input: RejectDocumentInput;
}): Promise<ReviewedAdminDocument> {
  const response = await api.patch<
    ApiResponse<ReviewedAdminDocument>
  >(
    `/admin/documents/${documentId}/reject`,
    input,
  );

  return response.data.data;
}