"use client";

import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CreateLeaveDialog } from "./create-leave-dialog";
import { MyLeaveHistory } from "./my-leave-history";
import { LeaveBalanceCards } from "./leave-balance-cards";

export function LeavePageContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <main className="flex flex-1 flex-col gap-6 max-w-8xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Leave Requests
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Apply for leave and track your leave history.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4" />
          Apply for Leave
        </Button>
      </div>

      <LeaveBalanceCards />
      <hr className="my-4" />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="size-4" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            Leave History
          </h2>
        </div>
        <MyLeaveHistory />
      </section>

      <CreateLeaveDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </main>
  );
}
