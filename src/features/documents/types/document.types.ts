export type DocumentType =
  | "PASSPORT"
  | "CV"
  | "NATIONAL_ID"
  | "CERTIFICATE"
  | "OTHER";

export type DocumentStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

/**
 * Employee-side document returned by:
 *
 * GET /documents
 * GET /documents/:documentId
 */
export interface EmployeeDocument {
  id: string;
  type: DocumentType;
  title: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;

  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;

  createdAt: string;
  updatedAt: string;
}

/**
 * Employee-side upload response.
 *
 * POST /documents
 *
 * The upload Swagger response includes additional
 * storage-related information.
 */
export interface UploadedEmployeeDocument
  extends EmployeeDocument {
  employeeId: string;
  bucket: string;
  storagePath: string;
}

/**
 * Temporary signed file response used by both
 * employee and admin document preview endpoints.
 */
export interface DocumentFile {
  url: string;
  expiresIn: number;
  originalFileName: string;
  mimeType: string;
}

/**
 * Employee upload request.
 */
export interface UploadDocumentInput {
  type: DocumentType;
  title: string;
  file: File;
}

/**
 * Employee information included in the
 * admin document list response.
 */
export interface AdminDocumentEmployeeSummary {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;

  user: {
    email: string;
    status: string;
  };

  department: {
    id: string;
    name: string;
  };
}

/**
 * Employee information included in the
 * admin document detail response.
 */
export interface AdminDocumentEmployeeDetails
  extends AdminDocumentEmployeeSummary {
  phone: string;
  jobTitle: string;
}

/**
 * Document returned by:
 *
 * GET /admin/documents
 */
export interface AdminDocumentListItem {
  id: string;
  type: DocumentType;
  title: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;

  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;

  employee: AdminDocumentEmployeeSummary;
}

/**
 * Document returned by:
 *
 * GET /admin/documents/:documentId
 */
export interface AdminDocumentDetails {
  id: string;
  type: DocumentType;
  title: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;

  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;

  employee: AdminDocumentEmployeeDetails;
}

/**
 * Supported query parameters for:
 *
 * GET /admin/documents
 */
export interface AdminDocumentListFilters {
  employeeId?: string;
  status?: DocumentStatus;
  type?: DocumentType;
}

/**
 * Request body for:
 *
 * PATCH /admin/documents/:documentId/verify
 */
export interface VerifyDocumentInput {
  note?: string;
}

/**
 * Request body for:
 *
 * PATCH /admin/documents/:documentId/reject
 */
export interface RejectDocumentInput {
  note: string;
}

/**
 * Employee information returned after an admin
 * verifies or rejects a document.
 */
export interface ReviewedDocumentEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
}

/**
 * Response data returned after:
 *
 * PATCH /admin/documents/:documentId/verify
 * PATCH /admin/documents/:documentId/reject
 */
export interface ReviewedAdminDocument {
  id: string;
  type: DocumentType;
  title: string;
  status: DocumentStatus;

  reviewedByUserId: string;
  reviewedAt: string;
  reviewNote: string | null;

  employee: ReviewedDocumentEmployee;
}