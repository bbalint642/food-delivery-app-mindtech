"use client"

import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Pill-shaped toggle button (foodora style) exposing its state via aria-pressed. */
export function FilterChip({
  pressed,
  className,
  ...props
}: ComponentProps<"button"> & { pressed: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        pressed
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-border bg-background hover:bg-muted",
        className,
      )}
      {...props}
    />
  )
}
