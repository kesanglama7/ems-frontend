"use client";

import {
  Eye,
  Info,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { EmployeeDocument } from "../types/document.types";

interface DocumentRowActionsProps {
  document: EmployeeDocument;

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

export function DocumentRowActions({
  document,
  onDetails,
  onPreview,
  onDelete,
}: DocumentRowActionsProps) {
  const canDelete =
    document.status === "PENDING" ||
    document.status === "REJECTED";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${document.title}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-40"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              onDetails(document)
            }
          >
            <Info className="size-4" />
            Details
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              onPreview(document)
            }
          >
            <Eye className="size-4" />
            Preview
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {canDelete && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  onDelete(document)
                }
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}