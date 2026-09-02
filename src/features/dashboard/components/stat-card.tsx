"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  href?: string;
  icon?: React.ReactNode;
  variant?: "default" | "warning" | "success" | "destructive";
  className?: string;
}

// Apply colors only to the icon background and text, keeping the card itself clean
const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  warning: {
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-400",
  },
  success: {
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
  },
  destructive: {
    icon: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
    value: "text-rose-700 dark:text-rose-400",
  },
};

export function StatCard({
  title,
  value,
  description,
  href,
  icon,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <Card className={`group transition-all hover:shadow-md ${className || ""}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold tracking-tight ${styles.value}`}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-xl ${styles.icon}`}>
              {icon}
            </div>
          )}
        </div>
        {href && (
          <div className="mt-4 flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
            View details <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}