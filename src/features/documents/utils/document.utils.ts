import type {
  DocumentStatus,
  DocumentType,
} from "../types/document.types";

export const DOCUMENT_TYPE_LABELS: Record<
  DocumentType,
  string
> = {
  PASSPORT: "Passport",
  CV: "CV",
  NATIONAL_ID: "National ID",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
};

export const DOCUMENT_STATUS_LABELS: Record<
  DocumentStatus,
  string
> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(
    Math.log(bytes) / Math.log(1024),
  );

  const value = bytes / 1024 ** index;

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatDocumentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}