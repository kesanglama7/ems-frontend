"use client";
import { useState } from "react";
import {
  Package,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  UserPlus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import EmployeeSearchSelect from "@/components/shared/admin/employee-search-select";
import { CreateRequestDialog } from "@/features/employee-requests/components/create-request-dialog";
import type { EmployeeRequest } from "@/features/employee-requests/types/employee-request.types";
import { api } from "@/lib/api";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";
import {
  useResources,
  useAssignments,
  useOfficeMutation,
  formatOfficeDate,
  type Resource,
  type Assignment,
} from "./api";
import { EmptyState, QueryFeedback } from "../../components/shared/admin/shared";

const groups = ["resources", "employee-requests", "notifications"];
export function ResourcesPage({ admin = false }: { admin?: boolean }) {
  const inventory = useResources();
  const assignments = useAssignments();
  const [tab, setTab] = useState<"inventory" | "assignments">(
    admin ? "inventory" : "assignments",
  );
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState(false);
  const [editing, setEditing] = useState<Resource | "new" | null>(null);
  const [assigning, setAssigning] = useState<Resource | null>(null);
  const [requesting, setRequesting] = useState<Resource | null>(null);
  const [returning, setReturning] = useState<Assignment | null>(null);
  const confirm = useConfirmDialogStore((s) => s.confirm);
  const archive = useOfficeMutation(
    (r: Resource) => api.patch(`/resources/${r.id}`, { isActive: !r.isActive }),
    "Resource status updated.",
    groups,
  );
  const returned = useOfficeMutation(
    (id: string) => api.post(`/resources/assignments/${id}/confirm-return`),
    "Return confirmed; stock restored.",
    groups,
  );
  const all = inventory.data?.data ?? [];
  const held = (assignments.data?.data ?? []).filter((a) => !a.returnedAt);
  const visibleResources = all.filter((r) =>
    `${r.name} ${r.description ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const visibleAssignments = (assignments.data?.data ?? []).filter(
    (a) =>
      (history || !a.returnedAt) &&
      `${a.resource.name} ${a.employee.firstName} ${a.employee.lastName} ${a.assetTag ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const query = tab === "inventory" ? inventory : assignments;
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {admin ? "Office resources" : "My office resources"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {admin
              ? "Track inventory, employee assignments and returns."
              : "See what you hold, request equipment, and arrange a return."}
          </p>
        </div>
        {admin && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Add resource
          </Button>
        )}
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: admin ? "Resource types" : "Available resource types",
            value: all.filter((r) => r.isActive).length,
          },
          {
            label: admin ? "Available units" : "Units in my care",
            value: admin
              ? all.reduce((n, r) => n + r.availableQuantity, 0)
              : held.reduce((n, a) => n + a.quantity, 0),
          },
          {
            label: "Returns requested",
            value: held.filter((a) => a.returnRequestedAt).length,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {query.isPending ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Button
            size="sm"
            variant={tab === "inventory" ? "default" : "ghost"}
            onClick={() => setTab("inventory")}
          >
            Inventory
          </Button>
          <Button
            size="sm"
            variant={tab === "assignments" ? "default" : "ghost"}
            onClick={() => setTab("assignments")}
          >
            {admin ? "Assignments" : "My equipment"}
          </Button>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Search resources or assignments"
            className="pl-9"
            placeholder="Search resources, names, asset tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <QueryFeedback
        pending={query.isPending}
        error={query.isError}
        retry={query.refetch}
      />
      {tab === "inventory" &&
        inventory.isSuccess &&
        (visibleResources.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleResources.map((r) => (
              <article
                key={r.id}
                className="flex flex-col rounded-xl border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Package className="size-5" />
                    </div>
                    <h2 className="break-words font-semibold">{r.name}</h2>
                  </div>
                  {!r.isActive && <Badge variant="secondary">Archived</Badge>}
                </div>
                <p className="mt-3 flex-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {r.description || "Office equipment"}
                </p>
                <div className="my-4 grid grid-cols-3 rounded-lg bg-muted/40 p-3 text-center text-xs">
                  <div>
                    <strong className="block text-lg text-foreground">
                      {r.totalQuantity}
                    </strong>
                    Total
                  </div>
                  <div>
                    <strong className="block text-lg text-emerald-600">
                      {r.availableQuantity}
                    </strong>
                    Available
                  </div>
                  <div>
                    <strong className="block text-lg text-foreground">
                      {r.totalQuantity - r.availableQuantity}
                    </strong>
                    Assigned
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {admin ? (
                    <>
                      <Button
                        size="sm"
                        disabled={!r.isActive || r.availableQuantity < 1}
                        onClick={() => setAssigning(r)}
                      >
                        <UserPlus className="size-4" />
                        Assign
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label={`Edit ${r.name}`}
                        onClick={() => setEditing(r)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={archive.isPending}
                        onClick={() =>
                          confirm({
                            title: r.isActive
                              ? "Archive resource?"
                              : "Restore resource?",
                            description: r.isActive
                              ? "New requests and assignments will be disabled. Existing assignments remain trackable."
                              : "Make this resource available again.",
                            confirmLabel: r.isActive ? "Archive" : "Restore",
                            onConfirm: async () => {
                              await archive.mutateAsync(r);
                            },
                          })
                        }
                      >
                        <Archive className="size-4" />
                        {r.isActive ? "Archive" : "Restore"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRequesting(r)}
                    >
                      Request resource
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>No resources match your search.</EmptyState>
        ))}
      {tab === "assignments" && (
        <section className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={history}
              onChange={(e) => setHistory(e.target.checked)}
            />
            Include returned equipment
          </label>
          {assignments.isSuccess &&
            (visibleAssignments.length ? (
              <div className="space-y-3">
                {visibleAssignments.map((a) => (
                  <article key={a.id} className="rounded-xl border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">
                            {a.resource.name}{" "}
                            <span className="font-normal text-muted-foreground">
                              × {a.quantity}
                            </span>
                          </h2>
                          <Badge
                            variant={
                              a.returnedAt
                                ? "secondary"
                                : a.returnRequestedAt
                                  ? "outline"
                                  : "default"
                            }
                          >
                            {a.returnedAt
                              ? "Returned"
                              : a.returnRequestedAt
                                ? "Return requested"
                                : "Assigned"}
                          </Badge>
                        </div>
                        {admin && (
                          <p className="mt-1 text-sm">
                            {a.employee.firstName} {a.employee.lastName}{" "}
                            <span className="text-muted-foreground">
                              · {a.employee.employeeCode}
                            </span>
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Assigned {formatOfficeDate(a.assignedAt)}
                          {a.assetTag ? ` · Asset ${a.assetTag}` : ""}
                          {a.returnedAt
                            ? ` · Returned ${formatOfficeDate(a.returnedAt)}`
                            : ""}
                        </p>
                      </div>
                      {!a.returnedAt && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!a.returnRequestedAt}
                            onClick={() => setReturning(a)}
                          >
                            <RotateCcw className="size-4" />
                            {admin ? "Request return" : "Return equipment"}
                          </Button>
                          {admin && (
                            <Button
                              size="sm"
                              disabled={returned.isPending}
                              onClick={() =>
                                confirm({
                                  title: "Confirm physical return?",
                                  description: `Confirm that ${a.quantity} unit(s) of ${a.resource.name} have been received. Available stock will increase.`,
                                  confirmLabel: "Confirm received",
                                  onConfirm: async () => {
                                    await returned.mutateAsync(a.id);
                                  },
                                })
                              }
                            >
                              Confirm received
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {a.note && (
                      <p className="mt-3 break-words text-sm text-muted-foreground">
                        {a.note}
                      </p>
                    )}
                    {a.returnRequestedAt && !a.returnedAt && (
                      <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                        {a.returnRequestNote || "Return requested."} Equipment
                        remains assigned until an administrator confirms
                        receipt.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState>
                {history
                  ? "No assignment history found."
                  : "No equipment is currently assigned."}
              </EmptyState>
            ))}
        </section>
      )}
      {editing && (
        <ResourceForm
          key={typeof editing === "string" ? "new" : editing.id}
          resource={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {assigning && (
        <AssignResourceDialog
          resource={assigning}
          onClose={() => setAssigning(null)}
        />
      )}
      {requesting && (
        <CreateRequestDialog
          open
          onOpenChange={(v) => {
            if (!v) setRequesting(null);
          }}
          initialResource={requesting}
        />
      )}
      {returning && (
        <ReturnDialog
          assignment={returning}
          onClose={() => setReturning(null)}
        />
      )}
    </main>
  );
}
function ResourceForm({
  resource,
  onClose,
}: {
  resource?: Resource;
  onClose: () => void;
}) {
  const [name, setName] = useState(resource?.name ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [count, setCount] = useState(String(resource?.totalQuantity ?? 1));
  const minimum = resource
    ? resource.totalQuantity - resource.availableQuantity
    : 0;
  const save = useOfficeMutation(
    (payload: { name: string; description: string; totalQuantity: number }) =>
      resource
        ? api.patch(`/resources/${resource.id}`, payload)
        : api.post("/resources", payload),
    "Resource saved.",
    groups,
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        totalQuantity: Number(count),
      });
      onClose();
    } catch {}
  }
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v && !save.isPending) onClose();
      }}
    >
      <DialogContent>
        <form className="space-y-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {resource ? "Edit resource" : "Add office resource"}
            </DialogTitle>
            <DialogDescription>
              Track the total quantity owned by the office.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="resource-name">Name</Label>
            <Input
              id="resource-name"
              required
              minLength={2}
              maxLength={160}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Laptop, mouse, keyboard…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-count">Total quantity</Label>
            <Input
              id="resource-count"
              type="number"
              required
              min={minimum}
              max={1000000}
              step={1}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {minimum} units currently assigned. Total cannot be lower than
              this.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-description">Description</Label>
            <Textarea
              id="resource-description"
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              disabled={save.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={save.isPending || name.trim().length < 2}
            >
              {save.isPending ? "Saving…" : "Save resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function AssignResourceDialog({
  resource,
  onClose,
  request,
}: {
  resource: Resource;
  onClose: () => void;
  request?: EmployeeRequest;
}) {
  const [employeeId, setEmployeeId] = useState(request?.employee.id ?? "");
  const [quantity, setQuantity] = useState(
    String(request?.resourceQuantity ?? 1),
  );
  const [assetTag, setAssetTag] = useState("");
  const [note, setNote] = useState("");
  const assign = useOfficeMutation(
    (payload: {
      employeeId: string;
      quantity: number;
      assetTag?: string;
      note?: string;
      requestId?: string;
    }) => api.post(`/resources/${resource.id}/assignments`, payload),
    "Resource assigned.",
    groups,
  );
  const qty = Number(quantity);
  const valid =
    !!employeeId &&
    Number.isInteger(qty) &&
    qty > 0 &&
    qty <= resource.availableQuantity &&
    (!assetTag.trim() || qty === 1);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    try {
      await assign.mutateAsync({
        employeeId,
        quantity: qty,
        assetTag: assetTag.trim() || undefined,
        note: note.trim() || undefined,
        requestId: request?.id,
      });
      onClose();
    } catch {}
  }
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v && !assign.isPending) onClose();
      }}
    >
      <DialogContent>
        <form className="space-y-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Assign {resource.name}</DialogTitle>
            <DialogDescription>
              {resource.availableQuantity} units available.
              {request ? " This will also resolve the employee request." : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Employee</Label>
            {request ? (
              <p className="rounded-lg border p-3 text-sm">
                {request.employee.firstName} {request.employee.lastName} ·{" "}
                {request.employee.employeeCode}
              </p>
            ) : (
              <EmployeeSearchSelect
                value={employeeId}
                onChange={setEmployeeId}
                disabled={assign.isPending}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment-quantity">Quantity</Label>
            <Input
              id="assignment-quantity"
              type="number"
              required
              min={1}
              max={resource.availableQuantity}
              step={1}
              value={quantity}
              disabled={!!request}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset-tag">
              Asset tag / serial number (optional)
            </Label>
            <Input
              id="asset-tag"
              maxLength={100}
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use quantity 1 for an individually tagged item.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment-note">Note (optional)</Label>
            <Textarea
              id="assignment-note"
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {qty > resource.availableQuantity && (
            <p role="alert" className="text-sm text-destructive">
              Not enough stock to fulfill this quantity.
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={assign.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || assign.isPending}>
              {assign.isPending
                ? "Assigning…"
                : request
                  ? "Assign and resolve request"
                  : "Assign resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function ReturnDialog({
  assignment,
  onClose,
}: {
  assignment: Assignment;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const action = useOfficeMutation(
    () =>
      api.post(`/resources/assignments/${assignment.id}/return-request`, {
        note: note.trim(),
      }),
    "Return requested.",
    groups,
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await action.mutateAsync();
      onClose();
    } catch {}
  }
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v && !action.isPending) onClose();
      }}
    >
      <DialogContent>
        <form className="space-y-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              Request return · {assignment.resource.name}
            </DialogTitle>
            <DialogDescription>
              The other party will be notified. Stock changes only after an
              administrator confirms receipt.
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="return-note">Note (optional)</Label>
          <Textarea
            id="return-note"
            value={note}
            maxLength={1000}
            onChange={(e) => setNote(e.target.value)}
            placeholder="When and where can this be handed over?"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={action.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={action.isPending}>
              {action.isPending ? "Sending…" : "Request return"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function FulfillResourceButton({
  request,
}: {
  request: EmployeeRequest;
}) {
  const inventory = useResources();
  const [open, setOpen] = useState(false);
  const resource = inventory.data?.data.find(
    (r) => r.id === request.resourceId,
  );
  return (
    <div className="mt-3 space-y-2">
      <Button
        variant="outline"
        disabled={!resource?.isActive}
        onClick={() => setOpen(true)}
      >
        <Package className="size-4" />
        Assign resource and resolve
      </Button>
      {inventory.isError && (
        <QueryFeedback pending={false} error retry={inventory.refetch} />
      )}
      <p className="text-xs text-muted-foreground">
        Assigning from here records the equipment handover and resolves this
        request together.
      </p>
      {open && resource && (
        <AssignResourceDialog
          resource={resource}
          request={request}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
