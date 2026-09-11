"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMyAttendanceHistory } from "@/features/attendance/hooks/use-attendance";
import { REQUEST_CATEGORIES, REQUEST_PRIORITIES } from "../constants/employee-request.constants";
import { useCreateRequest } from "../hooks/use-employee-requests";
import type { RequestCategory, RequestPriority } from "../types/employee-request.types";

export function CreateRequestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [category, setCategory] = useState<RequestCategory>("GENERAL_QUESTION");
  const [priority, setPriority] = useState<RequestPriority>("NORMAL");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attendanceId, setAttendanceId] = useState("");
  const create = useCreateRequest();
  const attendance = useMyAttendanceHistory();

  const valid = subject.trim().length >= 3 && description.trim().length >= 5 && (category !== "ATTENDANCE_CORRECTION" || Boolean(attendanceId));

  function reset() { setCategory("GENERAL_QUESTION"); setPriority("NORMAL"); setSubject(""); setDescription(""); setAttendanceId(""); }
  function handleOpenChange(nextOpen: boolean) { if (!nextOpen) reset(); onOpenChange(nextOpen); }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    await create.mutateAsync({ category, priority, subject: subject.trim(), description: description.trim(), ...(attendanceId ? { attendanceId } : {}) });
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader><DialogTitle>New employee request</DialogTitle><DialogDescription>Describe what you need. The administration team will review it and provide a final response.</DialogDescription></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={(value) => { setCategory(value as RequestCategory); if (value !== "ATTENDANCE_CORRECTION") setAttendanceId(""); }}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{REQUEST_CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Priority</Label><Select value={priority} onValueChange={(value) => setPriority(value as RequestPriority)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{REQUEST_PRIORITIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div>
          </div>
          {category === "ATTENDANCE_CORRECTION" && <div className="space-y-2"><Label>Attendance record</Label><Select value={attendanceId} onValueChange={(value) => setAttendanceId(value ?? "")}><SelectTrigger className="w-full"><SelectValue placeholder="Choose the record to correct" /></SelectTrigger><SelectContent>{(attendance.data?.data ?? []).map((record) => <SelectItem key={record.id} value={record.id}>{new Date(record.workDate).toLocaleDateString()} · {record.status.replaceAll("_", " ").toLowerCase()}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">Select the exact attendance entry so the admin can review it quickly.</p></div>}
          <div className="space-y-2"><Label htmlFor="request-subject">Subject</Label><Input id="request-subject" maxLength={150} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Briefly describe what you need" /></div>
          <div className="space-y-2"><div className="flex justify-between"><Label htmlFor="request-description">Description</Label><span className="text-xs text-muted-foreground">{description.length}/2000</span></div><Textarea id="request-description" rows={6} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Include the details needed to understand and resolve your request." /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button><Button type="submit" disabled={!valid || create.isPending}>{create.isPending && <LoaderCircle className="size-4 animate-spin" />}Submit request</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
