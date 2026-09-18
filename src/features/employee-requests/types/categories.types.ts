export type ManagedCategory = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export type CategoryFormValues = {
  name: string;
  description: string;
};

export type SaveCategoryInput = CategoryFormValues & {
  id?: string;
};