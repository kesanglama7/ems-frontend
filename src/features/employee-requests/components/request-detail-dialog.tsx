"use client";

import { useState } from "react";
import { Ban, CheckCircle2, CircleDot, Clock3, LoaderCircle, LockKeyhole, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/auth.store";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";
import { REQUEST_CATEGORIES, REQUEST_DISMISSAL_REASONS, REQUEST_STATUSES, labelFor } from "../constants/employee-request.constants";
import {
  useAssignRequest,
  useCancelRequest,
  useDismissRequest,
  useRequestDetail,
  useUpdateAdminNote,
  useUpdateRequestStatus,
} from "../hooks/use-employee-requests";
import type { RequestActivity, RequestDismissalReason, RequestStatus } from "../types/employee-request.types";
import { EmployeeAvatar, PriorityBadge, RequestStatusBadge, employeeName, requestCode } from "./request-ui";

const CLOSED: RequestStatus[] = ["RESOLVED", "REJECTED", "DISMISSED", "CANCELLED"];

function activityText(activity: RequestActivity) {
  if (activity.action === "CREATED") return "Request submitted";
  if (activity.action === "ASSIGNED") return "Assigned and moved to In progress";
  if (activity.action === "ADMIN_NOTE_UPDATED") return "Private admin note updated";
  if (activity.action === "DISMISSED") return "Request dismissed";
  if (activity.action === "CANCELLED") return "Request cancelled";
  if (activity.toStatus) return `Status changed to ${labelFor(REQUEST_STATUSES, activity.toStatus)}`;
  return "Request updated";
}

export function RequestDetailDialog({
  id,
  admin,
  onOpenChange,
}: {
  id: string | null;
  admin: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const user = useAuthStore((state) => state.user);
  const confirm = useConfirmDialogStore((state) => state.confirm);
  const query = useRequestDetail(id, admin);
  const cancel = useCancelRequest();
  const dismiss = useDismissRequest();
  const assign = useAssignRequest();
  const updateNote = useUpdateAdminNote();
  const updateStatus = useUpdateRequestStatus();
  const [status, setStatus] = useState<RequestStatus>("IN_PROGRESS");
  const [resolutionNote, setResolutionNote] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [dismissOpen, setDismissOpen] = useState(false);
  const [dismissalReason, setDismissalReason] = useState<RequestDismissalReason>("SPAM_OR_INAPPROPRIATE");
  const [dismissalNote, setDismissalNote] = useState("");
  const [loadedVersion, setLoadedVersion] = useState<string | null>(null);
  const request = query.data?.data;

  const requestVersion = request ? `${request.id}:${request.updatedAt}` : null;
  if (request && requestVersion !== loadedVersion) {
    setLoadedVersion(requestVersion);
    setStatus(request.status === "OPEN" ? "IN_PROGRESS" : request.status);
    setResolutionNote(request.resolutionNote ?? "");
    setAdminNote(request.adminNote ?? "");
  }

  async function saveAdminNote() {
    if (!id) return;
    await updateNote.mutateAsync({ id, adminNote: adminNote.trim() || null });
  }

  async function saveStatus() {
    if (!id) return;
    await updateStatus.mutateAsync({
      id,
      status,
      resolutionNote: status === "RESOLVED" || status === "REJECTED" ? resolutionNote.trim() : undefined,
    });
  }

  async function dismissRequest() {
    if (!id) return;
    await dismiss.mutateAsync({
      id,
      payload: { reason: dismissalReason, ...(dismissalNote.trim() ? { note: dismissalNote.trim() } : {}) },
    });
    setDismissOpen(false);
    onOpenChange(false);
  }

  function handleCancel() {
    if (!id) return;
    confirm({
      title: "Cancel this request?",
      description: "Only open requests can be cancelled. This action cannot be reversed.",
      confirmLabel: "Cancel request",
      destructive: true,
      onConfirm: async () => {
        await cancel.mutateAsync(id);
      },
    });
  }

  return (
    <>
    <Sheet open={Boolean(id)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-2xl">
        {query.isPending || !request ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader className="border-b px-6 py-5 pr-14">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium tracking-wide text-muted-foreground">{requestCode(request.requestNumber)}</span>
                <RequestStatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
              </div>
              <SheetTitle className="mt-2 text-xl">{request.subject}</SheetTitle>
              <SheetDescription>
                Submitted {new Date(request.createdAt).toLocaleString()}
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-6 p-6">
                {admin && (
                  <section className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
                    <EmployeeAvatar request={request} className="size-10" />
                    <div className="min-w-0">
                      <p className="font-medium">{employeeName(request)}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.employee.employeeCode} · {request.employee.department?.name ?? "No department"}
                      </p>
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="text-sm font-semibold">Request details</h3>
                  <div className="mt-3 grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="mt-1 text-sm font-medium">{labelFor(REQUEST_CATEGORIES, request.category)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="mt-1 text-sm font-medium">{request.employee.department?.name ?? "Not assigned"}</p>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap rounded-xl border p-4 text-sm leading-6">{request.description}</p>
                  {request.attendance && (
                    <div className="mt-3 rounded-xl border bg-muted/25 p-4 text-sm">
                      <p className="font-medium">Related attendance</p>
                      <p className="mt-1 text-muted-foreground">
                        {new Date(request.attendance.workDate).toLocaleDateString()} · {request.attendance.status.replaceAll("_", " ").toLowerCase()}
                      </p>
                    </div>
                  )}
                </section>

                {request.resolutionNote && (
                  <section className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="size-4" />
                      Admin response
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/80">{request.resolutionNote}</p>
                  </section>
                )}

                {request.status === "DISMISSED" && request.dismissalReason && (
                  <section className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-900 dark:bg-violet-950/30">
                    <div className="flex items-center gap-2 text-sm font-semibold text-violet-800 dark:text-violet-300">
                      <Ban className="size-4" />
                      Request dismissed
                    </div>
                    <p className="mt-2 text-sm text-violet-900/80 dark:text-violet-100/80">
                      {REQUEST_DISMISSAL_REASONS.find((item) => item.value === request.dismissalReason)?.label ?? request.dismissalReason}
                    </p>
                    {request.dismissalNote && <p className="mt-1 whitespace-pre-wrap text-sm text-violet-900/70 dark:text-violet-100/70">{request.dismissalNote}</p>}
                  </section>
                )}

                {admin && (
                  <section className="space-y-3 rounded-xl border p-4">
                    <div className="flex items-start gap-2">
                      <LockKeyhole className="mt-0.5 size-4 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-semibold">Private admin note</h3>
                        <p className="text-xs text-muted-foreground">Only administrators can see this note.</p>
                      </div>
                    </div>
                    <Textarea
                      rows={4}
                      maxLength={2000}
                      value={adminNote}
                      onChange={(event) => setAdminNote(event.target.value)}
                      placeholder="Add investigation details or an internal reminder…"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={saveAdminNote}
                        disabled={updateNote.isPending || adminNote === (request.adminNote ?? "")}
                      >
                        {updateNote.isPending && <LoaderCircle className="size-4 animate-spin" />}
                        Save note
                      </Button>
                    </div>
                  </section>
                )}

                {admin && !CLOSED.includes(request.status) && (
                  <section className="space-y-4 rounded-xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">Review and resolve</h3>
                        <p className="text-xs text-muted-foreground">Update the request and provide a final response.</p>
                      </div>
                      {!request.assignedAdminId && user && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => assign.mutate({ id: request.id, adminUserId: user.id })}
                          disabled={assign.isPending}
                        >
                          <UserRoundCheck className="size-4" />
                          Assign to me
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={status} onValueChange={(value) => setStatus(value as RequestStatus)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(status === "RESOLVED" || status === "REJECTED") && (
                      <div className="space-y-2">
                        <Label>Final response</Label>
                        <Textarea
                          rows={4}
                          maxLength={1000}
                          value={resolutionNote}
                          onChange={(event) => setResolutionNote(event.target.value)}
                          placeholder="Explain the decision to the employee…"
                        />
                        <p className="text-xs text-muted-foreground">This response will be visible to the employee.</p>
                      </div>
                    )}
                    <div className="flex flex-wrap justify-between gap-2">
                      <Button type="button" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDismissOpen(true)}>
                        <Ban className="size-4" />Dismiss request
                      </Button>
                      <Button
                        type="button"
                        onClick={saveStatus}
                        disabled={updateStatus.isPending || (status !== "IN_PROGRESS" && status !== "OPEN" && !resolutionNote.trim())}
                      >
                        {updateStatus.isPending && <LoaderCircle className="size-4 animate-spin" />}
                        Update request
                      </Button>
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Activity history</h3>
                  </div>
                  <div className="mt-4 space-y-0">
                    {(request.activities ?? []).map((activity, index, activities) => (
                      <div key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < activities.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-border" />}
                        <CircleDot className="relative z-10 mt-0.5 size-4 shrink-0 bg-background text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{activityText(activity)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </ScrollArea>

            {!admin && request.status === "OPEN" && (
              <SheetFooter className="border-t px-6 py-4">
                <Button type="button" variant="destructive" onClick={handleCancel} disabled={cancel.isPending}>
                  Cancel request
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
    <Dialog open={dismissOpen} onOpenChange={setDismissOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dismiss request</DialogTitle>
          <DialogDescription>Use this for spam, duplicates, or requests that should not enter the normal workflow.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={dismissalReason} onValueChange={(value) => setDismissalReason(value as RequestDismissalReason)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REQUEST_DISMISSAL_REASONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Additional note (optional)</Label>
            <Textarea rows={3} maxLength={500} value={dismissalNote} onChange={(event) => setDismissalNote(event.target.value)} placeholder="Add context for the employee…" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDismissOpen(false)}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={dismissRequest} disabled={dismiss.isPending}>
            {dismiss.isPending && <LoaderCircle className="size-4 animate-spin" />}
            Dismiss request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
