"use client";
import { useRef, useState, type FormEvent } from "react";
import { LoaderCircle, Megaphone, UsersRound } from "lucide-react";
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
import { useDepartments } from "@/features/departments/hooks/use-departments";
import { priorityLabel } from "../../format";
import { usePublishAnnouncement, useSaveAnnouncement } from "../../hooks";
import type {
    Announcement,
    AnnouncementAudience,
    AnnouncementPayload,
    AnnouncementPriority,
} from "../../types";

const priorityItems: Array<{
    label: string;
    value: AnnouncementPriority;
}> = [
    { label: priorityLabel.NORMAL, value: "NORMAL" },
    { label: priorityLabel.IMPORTANT, value: "IMPORTANT" },
    { label: priorityLabel.URGENT, value: "URGENT" },
];

export function AnnouncementForm({
    open,
    onClose,
    existing,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    existing?: Announcement;
    onSaved?: (id: string) => void;
}) {
    const departments = useDepartments();
    const save = useSaveAnnouncement();
    const publish = usePublishAnnouncement();
    const savedId = useRef(existing?.id);
    const [submitting, setSubmitting] = useState(false);
    const busy = submitting || save.isPending || publish.isPending;
    const [title, setTitle] = useState(existing?.title ?? "");
    const [body, setBody] = useState(existing?.body ?? "");
    const [priority, setPriority] = useState<AnnouncementPriority>(
        existing?.priority ?? "NORMAL",
    );
    const [audience, setAudience] = useState<AnnouncementAudience>(
        existing?.audience ?? "ALL_EMPLOYEES",
    );
    const [departmentId, setDepartmentId] = useState(
        existing?.departmentId ?? "",
    );
    const [showOnLogin, setShowOnLogin] = useState(
        existing?.showOnLogin ?? false,
    );
    const [acknowledgmentRequired, setAcknowledgmentRequired] = useState(
        existing?.acknowledgmentRequired ?? false,
    );
    const [error, setError] = useState("");
    const availableDepartments =
        departments.data?.data.filter(
            (item) => item.isActive || item.id === departmentId,
        ) ?? [];
    const audienceItems = [
        { label: "All departments", value: "ALL_EMPLOYEES" },
        ...availableDepartments.map((item) => ({
            label: `${item.name}${item.isActive ? "" : " (inactive)"}`,
            value: `department:${item.id}`,
        })),
    ];

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;
        const publishNow =
            (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ===
            "publish";
        setError("");
        const name = title.trim();
        const content = body.trim();
        if (
            name.length < 3 ||
            name.length > 160 ||
            content.length < 5 ||
            content.length > 10_000
        ) {
            setError(
                "Use a title of 3–160 characters and a message of 5–10,000 characters.",
            );
            return;
        }
        if (audience === "DEPARTMENT" && !departmentId) {
            setError("Choose a department before saving.");
            return;
        }
        const payload: AnnouncementPayload = {
            title: name,
            body: content,
            priority,
            audience,
            ...(audience === "DEPARTMENT" ? { departmentId } : {}),
            showOnLogin,
            acknowledgmentRequired,
        };
        setSubmitting(true);
        try {
            const response = await save.mutateAsync({
                id: savedId.current,
                payload,
            });
            savedId.current = response.data.id;
            if (publishNow) {
                try {
                    await publish.mutateAsync(response.data.id);
                } catch {
                    setError("Draft saved, but publication failed. Try Publish now again.");
                    return;
                }
            }
            onClose();
            onSaved?.(response.data.id);
        } catch {
            /* The mutation shows the server error. */
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next && !busy) onClose();
            }}
        >
            <DialogContent className="max-h-[min(80dvh,720px)] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Megaphone className="size-5 text-primary" />
                        {existing ? "Edit announcement" : "New announcement"}
                    </DialogTitle>
                    <DialogDescription>
                        Save a draft or publish now to notify employees.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(event) => void submit(event)}
                    className="space-y-5"
                >
                    <div className="space-y-2">
                        <Label htmlFor="notice-title">Title</Label>
                        <Input
                            id="notice-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            maxLength={160}
                            placeholder="e.g. Updated office hours"
                            required
                        />
                        <p className="text-right text-xs text-muted-foreground">
                            {title.length}/160
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notice-body">Message</Label>
                        <Textarea
                            id="notice-body"
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            maxLength={10_000}
                            rows={7}
                            className="min-h-40 resize-y"
                            placeholder="Tell employees what has changed, when it takes effect, and what they should do."
                            required
                        />
                        <p className="text-right text-xs text-muted-foreground">
                            {body.length}/10,000
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="notice-priority">Priority</Label>
                            <Select
                                items={priorityItems}
                                value={priority}
                                onValueChange={(value) => {
                                    if (value) {
                                        setPriority(value);
                                    }
                                }}
                            >
                                <SelectTrigger
                                    id="notice-priority"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityItems.map((item) => (
                                        <SelectItem
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notice-audience">Audience</Label>
                            <Select
                                items={audienceItems}
                                value={
                                    audience === "DEPARTMENT"
                                        ? `department:${departmentId}`
                                        : "ALL_EMPLOYEES"
                                }
                                onValueChange={(value) => {
                                    if (!value) return;
                                    if (value === "ALL_EMPLOYEES") {
                                        setAudience("ALL_EMPLOYEES");
                                        setDepartmentId("");
                                    } else {
                                        setAudience("DEPARTMENT");
                                        setDepartmentId(
                                            value.slice("department:".length),
                                        );
                                    }
                                }}
                            >
                                <SelectTrigger
                                    id="notice-audience"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                    {audienceItems.map((item) => (
                                        <SelectItem
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {departments.isPending && (
                                <p className="text-xs text-muted-foreground">
                                    Loading departments…
                                </p>
                            )}
                            {departments.isError && (
                                <p className="text-xs text-destructive">
                                    Couldn’t load departments. All departments is still available.
                                </p>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        All departments includes employees without a department.
                    </p>
                    <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                        <label className="flex cursor-pointer items-start gap-3 text-sm">
                            <input
                                type="checkbox"
                                className="mt-1 size-4 accent-primary"
                                checked={showOnLogin}
                                onChange={(event) =>
                                    setShowOnLogin(event.target.checked)
                                }
                            />
                            <span>
                                <strong className="block font-medium">
                                    Show at login
                                </strong>
                                <span className="text-muted-foreground">
                                    Unread notices appear in a dialog when an
                                    employee enters the portal.
                                </span>
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 text-sm">
                            <input
                                type="checkbox"
                                className="mt-1 size-4 accent-primary"
                                checked={acknowledgmentRequired}
                                onChange={(event) =>
                                    setAcknowledgmentRequired(
                                        event.target.checked,
                                    )
                                }
                            />
                            <span>
                                <strong className="block font-medium">
                                    Require acknowledgment
                                </strong>
                                <span className="text-muted-foreground">
                                    Track who explicitly confirmed reading this
                                    notice.
                                </span>
                            </span>
                        </label>
                    </div>
                    <p className="flex items-start gap-2 text-xs text-muted-foreground">
                        <UsersRound className="mt-0.5 size-4 shrink-0" />
                        The recipient list is captured when the announcement is
                        published. The push includes a link to the notice; the
                        full message stays in the signed-in portal.
                    </p>
                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                        >
                            {error}
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={busy}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" value="draft" disabled={busy}>
                            {busy && (
                                <LoaderCircle className="animate-spin" />
                            )}
                            {existing ? "Save changes" : "Create draft"}
                        </Button>
                        <Button type="submit" value="publish" disabled={busy}>
                            {busy && <LoaderCircle className="animate-spin" />}
                            Publish now
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
