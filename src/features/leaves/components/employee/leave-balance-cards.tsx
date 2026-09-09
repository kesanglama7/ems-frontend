"use client";

import { Info, Infinity, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMyLeaveBalance } from "../../hooks/use-my-leaves";

export function LeaveBalanceCards() {
  const year = new Date().getFullYear();
  const { data, isPending } = useMyLeaveBalance(year);

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded-md" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const balances = data?.data.balances ?? [];

  return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="size-4" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            {year} Leave Balance
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {balances.map((balance) => {
            const hasUsedOrPending =
              (balance.usedDays ?? 0) > 0 || (balance.pendingDays ?? 0) > 0;

            return (
              <Card
                key={balance.leaveTypeId}
                className="relative overflow-hidden transition-all hover:shadow-md p-4 -space-y-4"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {balance.name}
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger render={
                      <button
                        type="button"
                        className="rounded-full p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`About ${balance.name}`}
                      >
                        <Info className="size-3.5" />
                      </button>
                    }>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-xs:max-w-[220px]">
                      {balance.limited ? (
                        <p>
                          Total allocation: {balance.totalDays} days for {year}.
                        </p>
                      ) : (
                        <p>
                          This is an unlimited leave type. Tracked usage does
                          not restrict your requests.
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </CardHeader>
                <CardContent className="space-y-1 px-0">
                  {balance.limited ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight">
                          {balance.remainingDays}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          days left
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  ((balance.remainingDays ?? 0) /
                                    (balance.totalDays || 1)) *
                                    100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {balance.usedDays} used &bull; {balance.pendingDays}{" "}
                          pending &bull; {balance.totalDays} total
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Infinity className="size-5" />
                        </span>
                        <div>
                          <p className="text-xl font-bold tracking-tight">
                            Unlimited
                          </p>
                          <p className="text-xs text-muted-foreground">
                            No cap applied
                          </p>
                        </div>
                      </div>

                      <div className="pt-1">
                        {hasUsedOrPending ? (
                          <p className="text-xs text-muted-foreground">
                            {balance.usedDays} days taken so far &bull;{" "}
                            {balance.pendingDays} pending approval
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No leaves taken yet this year
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
  );
}