"use client";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoticeCard } from "./notice-card";
import { useMyAnnouncements } from "../../hooks";
export function EmployeeDashboardNotices() {
    const query = useMyAnnouncements(1, 3);
    if (query.isPending)
        return (
            <section
                aria-label="Loading company announcements"
                className="h-28 animate-pulse rounded-xl bg-muted/40"
            />
        );
    if (query.isError || !query.data?.data.length) return null;
    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <Megaphone className="size-5 text-primary" />
                        From your company
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Updates shared with you and your team.
                    </p>
                </div>
              <Link href="/employee/announcements">
                <Button
                    variant="ghost"
                    size="sm"
                >
                    View all <ArrowRight />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {query.data.data.map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} compact />
                ))}
            </div>
        </section>
    );
}
