"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/admin/shared";
import { ManagedCategory } from "../../types/categories.types";
import { PenSquare } from "lucide-react";

type RequestCategoriesListProps = {
  categories: ManagedCategory[];
  togglePending: boolean;
  onEdit: (category: ManagedCategory) => void;
  onToggle: (category: ManagedCategory) => void;
};

export function RequestCategoriesList({
  categories,
  togglePending,
  onEdit,
  onToggle,
}: RequestCategoriesListProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <Table className="min-w-[640px] table-fixed">
        <colgroup>
          <col className="w-[25%]" />
          <col />
          <col className="w-[180px]" />
          <col className="w-[100px]" />
        </colgroup>

        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="px-5">Category</TableHead>
            <TableHead className="px-5">Description</TableHead>
            <TableHead className="px-5">Status</TableHead>
            <TableHead className="px-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="px-5 py-4 font-medium">
                {category.name}
              </TableCell>

              <TableCell className="px-5 py-4 text-muted-foreground">
                <div className="truncate" title={category.description || undefined}>
                  {category.description || "—"}
                </div>
              </TableCell>

              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <Switch
                    checked={category.isActive}
                    disabled={togglePending}
                    aria-label={`${category.isActive ? "Deactivate" : "Activate"} ${category.name}`}
                    onCheckedChange={(checked) => {
                      if (checked !== category.isActive) {
                        onToggle(category);
                      }
                    }}
                  />
                  <span
                    className={
                      category.isActive
                        ? "text-green-700 dark:text-green-400"
                        : "text-muted-foreground"
                    }
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </TableCell>

              <TableCell className="px-5 py-4 text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(category)}
                >
                  <PenSquare />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {categories.length === 0 && (
        <div className="p-6">
          <EmptyState>No categories yet.</EmptyState>
        </div>
      )}
    </div>
  );
}