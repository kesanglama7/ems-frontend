import type { DocumentType } from "../types/document.types";

export const DOCUMENT_TYPES = [
  "PASSPORT",
  "CV",
  "NATIONAL_ID",
  "CERTIFICATE",
  "OTHER",
] as const satisfies readonly DocumentType[];

export const DOCUMENT_ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const DOCUMENT_ACCEPT =
  ".pdf,.jpg,.jpeg,.png";

export const DOCUMENT_MAX_FILE_SIZE =
  5 * 1024 * 1024;