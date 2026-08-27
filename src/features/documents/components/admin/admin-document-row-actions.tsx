"use client";

import {
  BadgeCheck,
  Eye,
  Info,
  MoreHorizontal,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AdminDocumentListItem } from "../../types/document.types";

interface AdminDocumentRowActionsProps {
  document: AdminDocumentListItem;

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

export function AdminDocumentRowActions({
  document,
  onDetails,
  onPreview,
  onVerify,
  onReject,
}: AdminDocumentRowActionsProps) {
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
        className="w-48"
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

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>
            Review
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() =>
              onVerify(document)
            }
          >
            <BadgeCheck className="size-4" />
            Verify
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onClick={() =>
              onReject(document)
            }
          >
            <XCircle className="size-4" />
            Reject
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}