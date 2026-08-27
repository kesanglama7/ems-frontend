export const departmentKeys = {
  all: ["departments"] as const,

  lists: () =>
    [...departmentKeys.all, "list"] as const,

  list: () =>
    [...departmentKeys.lists()] as const,

  details: () =>
    [...departmentKeys.all, "detail"] as const,

  detail: (departmentId: string) =>
    [
      ...departmentKeys.details(),
      departmentId,
    ] as const,
};