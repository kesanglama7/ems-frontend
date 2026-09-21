"use client";

import { useState } from "react";
import {
  useRequestCategories,
  useResources,
  type Resource,
} from "@/features/office/api";
import { Choice, QueryFeedback } from "@/components/shared/admin/shared";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMyAttendanceHistory } from "@/features/attendance/hooks/use-attendance";
import { REQUEST_PRIORITIES } from "../constants/employee-request.constants";
import { useCreateRequest } from "../hooks/use-employee-requests";
import type { RequestPriority } from "../types/employee-request.types";

export function CreateRequestDialog({
  open,
  onOpenChange,
  initialResource,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialResource?: Resource | null;
}) {
  const categories = useRequestCategories(open);
  const resources = useResources(open);
  const [categoryId, setCategory] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const selectedId = resourceId || initialResource?.id || "";
  const chosenCategory = categories.data?.data.find((c) => c.id === categoryId);
  const category = chosenCategory?.legacyCategory;

  const [priority, setPriority] = useState<RequestPriority>("NORMAL");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attendanceId, setAttendanceId] = useState("");
  const create = useCreateRequest();
  const attendance = useMyAttendanceHistory();

  const valid =
    Boolean(categoryId) &&
    !fileError &&
    subject.trim().length >= 3 &&
    description.trim().length >= 5 &&
    (category !== "ATTENDANCE_CORRECTION" || Boolean(attendanceId));

  function reset() {
    setCategory("");
    setResourceId("");
    setQuantity(1);
    setAttachments([]);
    setFileError("");
    setPriority("NORMAL");
    setSubject("");
    setDescription("");
    setAttendanceId("");
  }
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    try {
      await create.mutateAsync({
        requestCategoryId: categoryId,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        attachments,
        ...(selectedId
          ? { resourceId: selectedId, resourceQuantity: quantity }
          : {}),
        ...(category === "ATTENDANCE_CORRECTION" && attendanceId
          ? { attendanceId }
          : {}),
      });
    } catch {
      return;
    }
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>New employee request</DialogTitle>
            <DialogDescription>
              Describe what you need. The administration team will review it and
              provide a final response.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="managed-request-category">Category</Label>
              <Choice
                id="managed-request-category"
                value={categoryId}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setAttendanceId("");
                }}
              >
                <option value="">Choose category</option>
                {categories.data?.data
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Choice>
              <QueryFeedback
                pending={categories.isPending}
                error={categories.isError}
                retry={categories.refetch}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as RequestPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_PRIORITIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {category === "ATTENDANCE_CORRECTION" && (
            <div className="space-y-2">
              <Label>Attendance record</Label>
              <Select
                value={attendanceId}
                onValueChange={(value) => setAttendanceId(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose the record to correct" />
                </SelectTrigger>
                <SelectContent>
                  {(attendance.data?.data ?? []).map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {new Date(record.workDate).toLocaleDateString()} ·{" "}
                      {record.status.replaceAll("_", " ").toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the exact attendance entry so the admin can review it
                quickly.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="request-subject">Subject</Label>
            <Input
              id="request-subject"
              maxLength={150}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe what you need"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="request-description">Description</Label>
              <span className="text-xs text-muted-foreground">
                {description.length}/2000
              </span>
            </div>
            <Textarea
              id="request-description"
              rows={6}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include the details needed to understand and resolve your request."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-resource">Office resource (optional)</Label>
            <Choice
              id="request-resource"
              value={selectedId}
              onChange={(e) => setResourceId(e.target.value)}
              disabled={Boolean(initialResource)}
            >
              <option value="">No resource</option>
              {resources.data?.data
                .filter((r) => r.isActive)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · {r.availableQuantity} available
                  </option>
                ))}
            </Choice>
            {selectedId && (
              <Input
                aria-label="Resource quantity"
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-attachments">
              Photo (optional)
            </Label>
            <Input
              id="request-attachments"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                const error =
                  files.length > 10
                    ? "Choose up to 10 photos."
                    : files.some(
                          (f) =>
                            f.size > 5 * 1024 * 1024 ||
                            !["image/jpeg", "image/png", "image/webp"].includes(
                              f.type,
                            ),
                        )
                      ? "Each photo must be JPEG, PNG or WebP and at most 5 MB."
                      : "";
                setFileError(error);
                setAttachments(error ? [] : files);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Upto 5 photos, 200kb each for compressing image use this <a href="http://image.pi7.org/compress-image-to-200kb" target="_blank" rel="noopener noreferrer">http://image.pi7.org/compress-image-to-200kb</a>
            </p>
            {fileError && (
              <p role="alert" className="text-sm text-destructive">
                {fileError}
              </p>
            )}
            {attachments.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span>{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setAttachments((files) =>
                      files.filter((_, index) => index !== i),
                    )
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || create.isPending}>
              {create.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
