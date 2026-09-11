"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNowStrict } from "date-fns";
import { CalendarDays, ChevronRight, GripVertical, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRequests, useUpdateRequestStatus } from "../hooks/use-employee-requests";
import type { EmployeeRequest, RequestQuery, RequestStatus } from "../types/employee-request.types";
import { CategoryLabel, EmployeeAvatar, PriorityBadge, employeeName, requestCode } from "./request-ui";

type BoardStatus = Extract<RequestStatus, "OPEN" | "IN_PROGRESS" | "RESOLVED">;

const COLUMNS: { status: BoardStatus; label: string; accent: string }[] = [
  { status: "OPEN", label: "Open", accent: "bg-amber-500" },
  { status: "IN_PROGRESS", label: "In progress", accent: "bg-blue-500" },
  { status: "RESOLVED", label: "Resolved", accent: "bg-emerald-500" },
];

function isBoardStatus(value: unknown): value is BoardStatus {
  return value === "OPEN" || value === "IN_PROGRESS" || value === "RESOLVED";
}

function RequestCard({ request, onOpen }: { request: EmployeeRequest; onOpen: (id: string) => void }) {
  const draggable = request.status === "OPEN" || request.status === "IN_PROGRESS";
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: request.id,
    disabled: !draggable,
    data: { request },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      onClick={() => onOpen(request.id)}
      className={cn(
        "group relative w-full rounded-xl border bg-card p-4 text-left shadow-xs transition hover:border-foreground/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        draggable && "touch-none cursor-grab active:cursor-grabbing",
        isDragging && "z-20 opacity-60 shadow-lg",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground">{requestCode(request.requestNumber)}</span>
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={request.priority} />
          {draggable && <GripVertical className="size-4 text-muted-foreground/60" aria-hidden="true" />}
        </div>
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-5">{request.subject}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{request.description}</p>
      <div className="mt-4 flex items-center gap-2">
        <EmployeeAvatar request={request} className="size-7" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{employeeName(request)}</p>
          <p className="truncate text-[11px] text-muted-foreground">{request.employee.department?.name ?? "No department"}</p>
        </div>
        <ChevronRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-[11px] text-muted-foreground">
        <span><CategoryLabel request={request} /></span>
        <span className="flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          {formatDistanceToNowStrict(new Date(request.createdAt), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
}

function BoardColumn({
  status,
  label,
  accent,
  count,
  query,
  onOpen,
  onShowAll,
}: {
  status: BoardStatus;
  label: string;
  accent: string;
  count: number;
  query: RequestQuery;
  onOpen: (id: string) => void;
  onShowAll: (status: RequestStatus) => void;
}) {
  const requests = useRequests(true, { ...query, status, page: 1, limit: 20 });
  const rows = requests.data?.data ?? [];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[520px] min-w-[300px] flex-1 flex-col rounded-2xl border border-transparent bg-muted/55 p-3 transition-colors xl:min-w-0",
        isOver && status !== "RESOLVED" && "border-primary/40 bg-primary/[0.06]",
        isOver && status === "RESOLVED" && "border-emerald-500/40 bg-emerald-500/[0.06]",
      )}
    >
      <header className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", accent)} />
          <h2 className="text-sm font-semibold">{label}</h2>
          <span className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
        </div>
      </header>

      <div className="space-y-3">
        {requests.isPending ? (
          Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-48 rounded-xl" />)
        ) : rows.length ? (
          rows.map((request) => <RequestCard key={request.id} request={request} onOpen={onOpen} />)
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-background/60 p-6 text-center">
            <Inbox className="size-5 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No {label.toLowerCase()} requests</p>
            <p className="mt-1 text-xs text-muted-foreground">Drag a request here or wait for a new submission.</p>
          </div>
        )}
      </div>

      {count > rows.length && (
        <button type="button" onClick={() => onShowAll(status)} className="mt-3 rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground">
          View all {count} in table
        </button>
      )}
    </section>
  );
}

export function AdminRequestBoard({
  query,
  counts,
  onOpen,
  onShowAll,
}: {
  query: RequestQuery;
  counts: Record<RequestStatus, number>;
  onOpen: (id: string) => void;
  onShowAll: (status: RequestStatus) => void;
}) {
  const updateStatus = useUpdateRequestStatus();
  const [resolutionRequest, setResolutionRequest] = useState<EmployeeRequest | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const request = event.active.data.current?.request as EmployeeRequest | undefined;
    const targetStatus = event.over?.id;
    if (!request || !isBoardStatus(targetStatus) || request.status === targetStatus) return;
    if (request.status === "RESOLVED") return;

    if (targetStatus === "RESOLVED") {
      setResolutionRequest(request);
      setResolutionNote("");
      return;
    }

    try {
      await updateStatus.mutateAsync({ id: request.id, status: targetStatus, request, boardQuery: query });
    } catch {
      // The mutation hook shows the API error and the cached card stays in place.
    }
  }

  async function resolveRequest() {
    if (!resolutionRequest || !resolutionNote.trim()) return;
    try {
      await updateStatus.mutateAsync({
        id: resolutionRequest.id,
        status: "RESOLVED",
        resolutionNote: resolutionNote.trim(),
        request: resolutionRequest,
        boardQuery: query,
      });
      setResolutionRequest(null);
      setResolutionNote("");
    } catch {
      // The mutation hook shows the API error.
    }
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4 xl:grid xl:min-w-0 xl:grid-cols-3">
            {COLUMNS.map((column) => (
              <BoardColumn
                key={column.status}
                {...column}
                count={counts[column.status] ?? 0}
                query={query}
                onOpen={onOpen}
                onShowAll={onShowAll}
              />
            ))}
          </div>
        </div>
      </DndContext>

      <Dialog open={Boolean(resolutionRequest)} onOpenChange={(open) => { if (!open) setResolutionRequest(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve request</DialogTitle>
            <DialogDescription>Add a short final response before moving this request to Resolved. The employee will see it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="drag-resolution-note">Final response</Label>
            <Textarea
              id="drag-resolution-note"
              rows={4}
              maxLength={1000}
              value={resolutionNote}
              onChange={(event) => setResolutionNote(event.target.value)}
              placeholder="Explain what was done to resolve the request…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResolutionRequest(null)}>Cancel</Button>
            <Button type="button" onClick={resolveRequest} disabled={!resolutionNote.trim() || updateStatus.isPending}>
              {updateStatus.isPending && <LoaderCircle className="size-4 animate-spin" />}
              Resolve request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
