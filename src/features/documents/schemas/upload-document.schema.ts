import { z } from "zod";

import {
  DOCUMENT_ACCEPTED_FILE_TYPES,
  DOCUMENT_MAX_FILE_SIZE,
  DOCUMENT_TYPES,
} from "../constants/document.constants";

export const uploadDocumentSchema = z.object({
  type: z.enum(DOCUMENT_TYPES, {
    message: "Select a document type.",
  }),

  title: z
    .string()
    .trim()
    .min(1, "Document title is required.")
    .max(
      150,
      "Document title must be 150 characters or less.",
    ),

  file: z
    .custom<File>(
      (value) => value instanceof File,
      "Select a document file.",
    )
    .refine(
      (file) =>
        DOCUMENT_ACCEPTED_FILE_TYPES.some(
          (type) => type === file.type,
        ),
      "Only PDF, JPG, JPEG, and PNG files are supported.",
    )
    .refine(
      (file) =>
        file.size <= DOCUMENT_MAX_FILE_SIZE,
      "File size must be 5 MB or less.",
    ),
});

export type UploadDocumentFormValues =
  z.infer<typeof uploadDocumentSchema>;