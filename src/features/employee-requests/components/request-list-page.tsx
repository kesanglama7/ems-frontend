"use client";

import { useDeferredValue, useState } from "react";
import { Columns3, Inbox, List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { REQUEST_CATEGORIES, REQUEST_PRIORITIES, REQUEST_STATUSES } from "../constants/employee-request.constants";
import { useAdminRequestSummary, useRequests } from "../hooks/use-employee-requests";
import type { RequestCategory, RequestPriority, RequestQuery, RequestStatus } from "../types/employee-request.types";
import { AdminRequestBoard } from "./admin-request-board";
import { CreateRequestDialog } from "./create-request-dialog";
import { RequestDetailDialog } from "./request-detail-dialog";
import { RequestTable } from "./request-table";

type ViewMode = "board" | "table";

function Filters({
  search,
  setSearch,
  category,
  setCategory,
  priority,
  setPriority,
  status,
  setStatus,
  showStatus,
}: {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  showStatus: boolean;
}) {
  return (
    <Card>
      <CardContent className={cn("grid gap-3 p-4", showStatus ? "md:grid-cols-[minmax(220px,1fr)_repeat(3,180px)]" : "md:grid-cols-[minmax(220px,1fr)_repeat(2,180px)]")}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search request or employee…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Select value={category} onValueChange={(value) => setCategory(value ?? "ALL")}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {REQUEST_CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {showStatus && (
          <Select value={status} onValueChange={(value) => setStatus(value ?? "ALL")}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {REQUEST_STATUSES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={priority} onValueChange={(value) => setPriority(value ?? "ALL")}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            {REQUEST_PRIORITIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

function EmptyRequests({ admin }: { admin: boolean }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted"><Inbox className="size-5 text-muted-foreground" /></div>
      <h2 className="mt-4 font-medium">No requests found</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {admin ? "No employee requests match these filters." : "Create your first request or adjust the filters."}
      </p>
    </div>
  );
}

function Pagination({
  page,
  setPage,
  pagination,
}: {
  page: number;
  setPage: (page: number) => void;
  pagination?: { page: number; total: number; totalPages: number };
}) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} · {pagination.total} requests</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

function AdminTable({
  query,
  page,
  setPage,
  onOpen,
}: {
  query: RequestQuery;
  page: number;
  setPage: (page: number) => void;
  onOpen: (id: string) => void;
}) {
  const requests = useRequests(true, { ...query, page, limit: 20 });
  const rows = requests.data?.data ?? [];
  if (requests.isPending) return <Skeleton className="h-96 rounded-xl" />;
  return (
    <>
      {rows.length ? <RequestTable requests={rows} admin onOpen={onOpen} /> : <EmptyRequests admin />}
      <Pagination page={page} setPage={setPage} pagination={requests.data?.pagination} />
    </>
  );
}

function AdminRequestsPage() {
  const [view, setView] = useState<ViewMode>("board");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const baseQuery: RequestQuery = {
    search: deferredSearch.trim() || undefined,
    category: category === "ALL" ? undefined : category as RequestCategory,
    priority: priority === "ALL" ? undefined : priority as RequestPriority,
    sortBy: "createdAt",
    sortOrder: "desc",
  };
  const summary = useAdminRequestSummary(baseQuery);
  const counts = summary.data?.data.counts ?? { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0, DISMISSED: 0, CANCELLED: 0 };
  const tableQuery: RequestQuery = { ...baseQuery, status: status === "ALL" ? undefined : status as RequestStatus };

  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function showAll(statusToShow: RequestStatus) {
    setStatus(statusToShow);
    setPage(1);
    setView("table");
  }

  return (
    <main className="mx-auto flex w-full max-w-8xl flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employee Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review, assign, and resolve employee queries.</p>
        </div>
        <div className="inline-flex w-fit rounded-lg border bg-muted/40 p-1">
          <Button size="sm" variant={view === "board" ? "secondary" : "ghost"} onClick={() => setView("board")}>
            <Columns3 className="size-4" />Board
          </Button>
          <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}>
            <List className="size-4" />Table
          </Button>
        </div>
      </div>

      <Filters
        search={search}
        setSearch={(value) => changeFilter(setSearch, value)}
        category={category}
        setCategory={(value) => changeFilter(setCategory, value)}
        priority={priority}
        setPriority={(value) => changeFilter(setPriority, value)}
        status={status}
        setStatus={(value) => changeFilter(setStatus, value)}
        showStatus={view === "table"}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{counts.OPEN + counts.IN_PROGRESS} active</span>
        <span>·</span>
        <button type="button" className="hover:text-foreground" onClick={() => showAll("REJECTED")}>{counts.REJECTED} rejected</button>
        <span>·</span>
        <button type="button" className="hover:text-foreground" onClick={() => showAll("DISMISSED")}>{counts.DISMISSED} dismissed</button>
        <span>·</span>
        <button type="button" className="hover:text-foreground" onClick={() => showAll("CANCELLED")}>{counts.CANCELLED} cancelled</button>
      </div>

      {view === "board" ? (
        <AdminRequestBoard query={baseQuery} counts={counts} onOpen={setSelectedId} onShowAll={showAll} />
      ) : (
        <AdminTable query={tableQuery} page={page} setPage={setPage} onOpen={setSelectedId} />
      )}

      <RequestDetailDialog id={selectedId} admin onOpenChange={(open) => { if (!open) setSelectedId(null); }} />
    </main>
  );
}

function EmployeeRequestsPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const query = useRequests(false, {
    search: deferredSearch.trim() || undefined,
    category: category === "ALL" ? undefined : category as RequestCategory,
    status: status === "ALL" ? undefined : status as RequestStatus,
    priority: priority === "ALL" ? undefined : priority as RequestPriority,
    page,
    limit: 20,
  });
  const requests = query.data?.data ?? [];

  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return (
    <main className="mx-auto flex w-full max-w-8xl flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submit a query and track the administration team’s response.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="size-4" />New request</Button>
      </div>
      <Filters
        search={search}
        setSearch={(value) => changeFilter(setSearch, value)}
        category={category}
        setCategory={(value) => changeFilter(setCategory, value)}
        priority={priority}
        setPriority={(value) => changeFilter(setPriority, value)}
        status={status}
        setStatus={(value) => changeFilter(setStatus, value)}
        showStatus
      />
      {query.isPending ? <Skeleton className="h-96 rounded-xl" /> : requests.length ? <RequestTable requests={requests} admin={false} onOpen={setSelectedId} /> : <EmptyRequests admin={false} />}
      <Pagination page={page} setPage={setPage} pagination={query.data?.pagination} />
      <CreateRequestDialog open={createOpen} onOpenChange={setCreateOpen} />
      <RequestDetailDialog id={selectedId} admin={false} onOpenChange={(open) => { if (!open) setSelectedId(null); }} />
    </main>
  );
}

export function RequestListPage({ admin }: { admin: boolean }) {
  return admin ? <AdminRequestsPage /> : <EmployeeRequestsPage />;
}
