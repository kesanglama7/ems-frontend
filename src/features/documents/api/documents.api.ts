import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";

import type {
  DocumentFile,
  EmployeeDocument,
  UploadedEmployeeDocument,
  UploadDocumentInput,
} from "../types/document.types";

export async function getMyDocuments(): Promise<
  EmployeeDocument[]
> {
  const response = await api.get<
    ApiResponse<EmployeeDocument[]>
  >("/documents");

  return response.data.data;
}

export async function getMyDocument(
  documentId: string,
): Promise<EmployeeDocument> {
  const response = await api.get<
    ApiResponse<EmployeeDocument>
  >(`/documents/${documentId}`);

  return response.data.data;
}

export async function uploadMyDocument(
  input: UploadDocumentInput,
): Promise<UploadedEmployeeDocument> {
  const formData = new FormData();

  formData.append("type", input.type);
  formData.append("title", input.title);
  formData.append("file", input.file);

  const response = await api.post<
    ApiResponse<UploadedEmployeeDocument>
  >("/documents", formData);

  return response.data.data;
}

export async function getMyDocumentFile(
  documentId: string,
): Promise<DocumentFile> {
  const response = await api.get<
    ApiResponse<DocumentFile>
  >(`/documents/${documentId}/file`);

  return response.data.data;
}

export async function deleteMyDocument(
  documentId: string,
): Promise<void> {
  await api.delete<ApiResponse<null>>(
    `/documents/${documentId}`,
  );
}