"use client";

import { useEffect, useState } from "react";

export const LiveClock = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date());
    };

    // Initial update after the effect has completed
    const timeout = setTimeout(updateTime, 0);

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  if (!time) {
    return (
      <div className="h-16 animate-pulse rounded-lg bg-muted" />
    );
  }

  return (
    <div className="flex items-baseline justify-center gap-1 font-mono">
      <span className="text-4xl font-bold tracking-tighter text-foreground">
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>

      <span className="text-lg font-medium text-muted-foreground">
        {time.toLocaleTimeString([], {
          second: "2-digit",
        })}
        s
      </span>
    </div>
  );
};