"use client"

import * as React from "react"
import { HelpCircle, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface HelpTooltipProps {
  title?: React.ReactNode
  description?: React.ReactNode
  trigger?: React.ReactNode
  icon?: LucideIcon
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function HelpTooltip({
  title,
  description,
  trigger,
  icon: Icon = HelpCircle,
  side = "top",
  align = "center",
  delayDuration = 150,
  className,
  triggerClassName,
  contentClassName,
}: HelpTooltipProps) {
  const isTextTrigger = typeof trigger === "string"
  const isCustomElement = React.isValidElement(trigger)

  return (
    <TooltipProvider delay={delayDuration}>
      <Tooltip>
        {isCustomElement ? (
          <TooltipTrigger
            render={trigger}
            className={cn(className, triggerClassName)}
          />
        ) : isTextTrigger ? (
          <TooltipTrigger
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xs text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-help",
              className,
              triggerClassName
            )}
          >
            <span>{trigger}</span>
            <Icon className="size-3.5 shrink-0 opacity-70" />
          </TooltipTrigger>
        ) : (
          <TooltipTrigger
            type="button"
            aria-label={typeof title === "string" ? title : "More info"}
            className={cn(
              "inline-flex size-5 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-help",
              className,
              triggerClassName
            )}
          >
            {trigger ?? <Icon className="size-3.5 shrink-0" />}
          </TooltipTrigger>
        )}

        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "max-w-xs space-y-1 p-3 text-xs leading-normal shadow-md",
            contentClassName
          )}
        >
          {title && (
            <p className="font-semibold leading-none text-popover-foreground">
              {title}
            </p>
          )}
          {description && (
            <p className="text-muted-white leading-snug">
              {description}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}