import {
  FileImage,
  FileText,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AdminDocumentListItem } from "../../types/document.types";
import {
  DOCUMENT_TYPE_LABELS,
  formatFileSize,
} from "../../utils/document.utils";

import { DocumentStatusBadge } from "../document-status-badge";
import { AdminDocumentRowActions } from "./admin-document-row-actions";

interface AdminDocumentsTableProps {
  documents: AdminDocumentListItem[];

  onDetails: (
    document: AdminDocumentListItem,
  ) => void;

  onPreview: (
    document: AdminDocumentListItem,
  ) => void;

  onVerify: (
    document: AdminDocumentListItem,
  ) => void;

  onReject: (
    document: AdminDocumentListItem,
  ) => void;
}

export function AdminDocumentsTable({
  documents,
  onDetails,
  onPreview,
  onVerify,
  onReject,
}: AdminDocumentsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Employee
              </TableHead>

              <TableHead>
                Document
              </TableHead>

              <TableHead>
                Type
              </TableHead>

              <TableHead>
                Department
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead className="w-12">
                <span className="sr-only">
                  Actions
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {documents.map((document) => {
              const employeeName =
                `${document.employee.firstName} ${document.employee.lastName}`.trim();

              const isImage =
                document.mimeType ===
                  "image/jpeg" ||
                document.mimeType ===
                  "image/png";

              const FileIcon = isImage
                ? FileImage
                : FileText;

              return (
                <TableRow
                  key={document.id}
                >
                  <TableCell>
                    <div className="min-w-48">
                      <p className="font-medium">
                        {employeeName}
                      </p>

                      <div className="mt-0.5 flex flex-col text-xs text-muted-foreground">
                        <span>
                          {
                            document.employee
                              .employeeCode
                          }
                        </span>

                        <span className="truncate">
                          {
                            document.employee
                              .user.email
                          }
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex min-w-56 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                        <FileIcon className="size-4 text-muted-foreground" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="truncate font-medium"
                          title={
                            document.title
                          }
                        >
                          {document.title}
                        </p>

                        <p
                          className="mt-0.5 max-w-56 truncate text-xs text-muted-foreground"
                          title={
                            document.originalFileName
                          }
                        >
                          {
                            document.originalFileName
                          }
                          {" · "}
                          {formatFileSize(
                            document.fileSize,
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {
                      DOCUMENT_TYPE_LABELS[
                        document.type
                      ]
                    }
                  </TableCell>

                  <TableCell>
                    <span className="block max-w-48 truncate">
                      {
                        document.employee
                          .department.name
                      }
                    </span>
                  </TableCell>

                  <TableCell>
                    <DocumentStatusBadge
                      status={
                        document.status
                      }
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <AdminDocumentRowActions
                      document={document}
                      onDetails={
                        onDetails
                      }
                      onPreview={
                        onPreview
                      }
                      onVerify={
                        onVerify
                      }
                      onReject={
                        onReject
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}