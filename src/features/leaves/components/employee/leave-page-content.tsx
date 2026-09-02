"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CreateLeaveDialog } from "./create-leave-dialog";
import { MyLeaveHistory } from "./my-leave-history";

export function LeavePageContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <main className="flex flex-1 flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

      <MyLeaveHistory />

      <CreateLeaveDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </main>
  );
}
