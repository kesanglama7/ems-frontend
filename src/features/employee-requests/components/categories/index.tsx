"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRequestCategories, useSaveRequestCategory, useToggleRequestCategory } from "../../hooks/use-catgeories";
import { CategoryFormValues, ManagedCategory } from "../../types/categories.types";
import { RequestCategoriesList } from "./request-categories-lists";
import { RequestCategoryDialogForm } from "./request-categories-dialog";
import { QueryFeedback } from "@/components/shared/admin/shared";


export function RequestCategoriesPage() {
  const categoriesQuery = useRequestCategories();
  const saveCategory = useSaveRequestCategory();
  const toggleCategory = useToggleRequestCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ManagedCategory | null>(null);

  const openCreateDialog = () => {
    saveCategory.reset();
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const openEditDialog = (
    category: ManagedCategory,
  ) => {
    saveCategory.reset();
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleSave = async (
    values: CategoryFormValues,
  ) => {
    await saveCategory.mutateAsync({
      id: editingCategory?.id,
      ...values,
    });

    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Request categories
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the categories employees choose
            when submitting requests. Deactivated
            categories remain on past requests.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateDialog}
        >
          Add category
        </Button>
      </div>

      <QueryFeedback
        pending={categoriesQuery.isPending}
        error={categoriesQuery.isError}
        retry={categoriesQuery.refetch}
      />

      {toggleCategory.isError && (
        <p
          role="alert"
          className="text-sm text-destructive"
        >
          Could not update the category status.
          Please try again.
        </p>
      )}

      {!categoriesQuery.isPending &&
        !categoriesQuery.isError && (
          <RequestCategoriesList
            categories={categoriesQuery.data ?? []}
            togglePending={toggleCategory.isPending}
            onEdit={openEditDialog}
            onToggle={(category) =>
              toggleCategory.mutate(category)
            }
          />
        )}

      {dialogOpen && (
        <RequestCategoryDialogForm
          category={editingCategory}
          saving={saveCategory.isPending}
          error={saveCategory.isError}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}