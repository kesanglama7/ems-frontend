"use client";

import { useEffect } from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ImageUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";

import {
  PROFILE_IMAGE_MAX_SIZE,
  PROFILE_IMAGE_TYPES,
} from "../constants/employee.constants";
import { useDeleteMyProfileImage } from "../hooks/use-delete-my-profile-image";
import { useMyEmployeeProfile } from "../hooks/use-my-employee-profile";
import { useUpdateMyProfile } from "../hooks/use-update-my-profile";
import { useUploadMyProfileImage } from "../hooks/use-upload-my-profile-image";
import {
  updateMyProfileSchema,
  type UpdateMyProfileFormValues,
} from "../schemas/update-my-profile.schema";

function getInitials(
  firstName: string,
  lastName: string,
) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

interface ReadOnlyFieldProps {
  label: string;
  value: string | null | undefined;
}

function ReadOnlyField({
  label,
  value,
}: ReadOnlyFieldProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">
        {label}
      </p>

      <p className="min-h-10 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        {value || "—"}
      </p>
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export function EmployeeProfilePage() {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useMyEmployeeProfile();

  const updateMutation =
    useUpdateMyProfile();

  const uploadMutation =
    useUploadMyProfileImage();

  const deleteImageMutation =
    useDeleteMyProfileImage();

  const confirm = useConfirmDialogStore(
    (state) => state.confirm,
  );

  const form =
    useForm<UpdateMyProfileFormValues>({
      resolver: zodResolver(
        updateMyProfileSchema,
      ),
      defaultValues: {
        phone: "",
      },
    });

  useEffect(() => {
    if (!profile) {
      return;
    }

    form.reset({
      phone: profile.phone ?? "",
    });
  }, [form, profile]);

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (isError || !profile) {
    return (
      <main className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Unable to load profile
            </CardTitle>

            <CardDescription>
              Your employee profile could not
              be loaded.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const onSubmit = (
    values: UpdateMyProfileFormValues,
  ) => {
    const phone = values.phone.trim();

    updateMutation.mutate({
      phone: phone || null,
    });
  };

  const handleImageSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !PROFILE_IMAGE_TYPES.includes(
        file.type as
          (typeof PROFILE_IMAGE_TYPES)[number],
      )
    ) {
      toast.error(
        "Select a JPEG, PNG, or WebP image.",
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      PROFILE_IMAGE_MAX_SIZE
    ) {
      toast.error(
        "Profile image must be 3 MB or smaller.",
      );

      event.target.value = "";
      return;
    }

    uploadMutation.mutate(file, {
      onSettled: () => {
        event.target.value = "";
      },
    });
  };

  const handleDeleteImage = () => {
    confirm({
      title: "Delete profile image?",
      description:
        "This will permanently remove your current profile image.",
      confirmLabel: "Delete image",
      destructive: true,

      onConfirm: async () => {
        await deleteImageMutation.mutateAsync();
      },
    });
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Profile
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View your employee information and
          manage the profile fields available
          to you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Profile image
          </CardTitle>

          <CardDescription>
            Upload a JPEG, PNG, or WebP image
            up to 3 MB.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-24">
            {profile.profileImageUrl && (
              <AvatarImage
                src={
                  profile.profileImageUrl
                }
                alt={`${profile.firstName} ${profile.lastName}`}
              />
            )}

            <AvatarFallback className="text-xl">
              {getInitials(
                profile.firstName,
                profile.lastName,
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-3">
            <input
              id="profile-image-input"
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={
                uploadMutation.isPending
              }
              onChange={
                handleImageSelection
              }
            />

            <div className="flex flex-wrap gap-2">
              <label
                htmlFor="profile-image-input"
                aria-disabled={
                  uploadMutation.isPending
                }
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                <ImageUp className="size-4" />

                {uploadMutation.isPending
                  ? "Uploading..."
                  : profile.profileImageUrl
                    ? "Replace image"
                    : "Choose image"}
              </label>

              {profile.profileImageUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={
                    deleteImageMutation.isPending
                  }
                  onClick={
                    handleDeleteImage
                  }
                >
                  <Trash2 />

                  {deleteImageMutation.isPending
                    ? "Deleting..."
                    : "Delete image"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Personal information
          </CardTitle>

          <CardDescription>
            Employment information is managed
            by your administrator. You can
            currently update your phone
            number.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-6"
            noValidate
            onSubmit={form.handleSubmit(
              onSubmit,
            )}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ReadOnlyField
                label="First name"
                value={
                  profile.firstName
                }
              />

              <ReadOnlyField
                label="Last name"
                value={
                  profile.lastName
                }
              />

              <ReadOnlyField
                label="Email"
                value={
                  profile.user.email
                }
              />

              <ReadOnlyField
                label="Employee code"
                value={
                  profile.employeeCode
                }
              />

              <ReadOnlyField
                label="Job title"
                value={
                  profile.jobTitle
                }
              />

              <ReadOnlyField
                label="Department"
                value={
                  profile.department?.name
                }
              />

              <ReadOnlyField
                label="Date of joining"
                value={formatDate(
                  profile.dateOfJoining,
                )}
              />

              <ReadOnlyField
                label="Account status"
                value={
                  profile.user.status
                }
              />
            </div>

            <Controller
              name="phone"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel
                    htmlFor={
                      field.name
                    }
                  >
                    Phone
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    autoComplete="tel"
                    placeholder="+977..."
                    aria-invalid={
                      fieldState.invalid
                    }
                    disabled={
                      updateMutation.isPending
                    }
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  updateMutation.isPending ||
                  !form.formState.isDirty
                }
              >
                {updateMutation.isPending
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
