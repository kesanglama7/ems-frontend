import { FileText } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { EmployeeDocument } from "../types/document.types";
import {
  DOCUMENT_TYPE_LABELS,
  formatDocumentDate,
  formatFileSize,
} from "../utils/document.utils";
import { DocumentStatusBadge } from "./document-status-badge";
import { DocumentRowActions } from "./document-row-actions";

interface DocumentsTableProps {
  documents: EmployeeDocument[];

  onDetails: (
    document: EmployeeDocument,
  ) => void;

  onPreview: (
    document: EmployeeDocument,
  ) => void;

  onDelete: (
    document: EmployeeDocument,
  ) => void;
}

export function DocumentsTable({
  documents,
  onDetails,
  onPreview,
  onDelete,
}: DocumentsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <div className="flex min-w-48 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {document.title}
                      </p>

                      {document.status === "REJECTED" &&
                        document.reviewNote && (
                          <p className="mt-0.5 max-w-64 truncate text-xs text-destructive">
                            {document.reviewNote}
                          </p>
                        )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {DOCUMENT_TYPE_LABELS[document.type]}
                </TableCell>

                <TableCell>
                  <span
                    className="block max-w-48 truncate text-muted-foreground"
                    title={document.originalFileName}
                  >
                    {document.originalFileName}
                  </span>
                </TableCell>

                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatFileSize(document.fileSize)}
                </TableCell>

                <TableCell>
                  <DocumentStatusBadge
                    status={document.status}
                  />
                </TableCell>

                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDocumentDate(document.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                    <DocumentRowActions
                    document={document}
                    onDetails={onDetails}
                    onPreview={onPreview}
                    onDelete={onDelete}
                    />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}