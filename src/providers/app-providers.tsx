"use client";

import { GlobalConfirmDialog } from "@/components/shared/global-confirm-dialog";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { PushNotificationManager } from "@/features/push-notifications/push-notification-manager";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <>
    <TooltipProvider>
        <QueryProvider>
        {children}
        <PushNotificationManager />
        </QueryProvider>
    </TooltipProvider>
    <Toaster
        position="top-right"
        richColors
        // closeButton
        />
      <GlobalConfirmDialog />
    </>
  );
}
