"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { buttonVariants } from "@/components/ui/button"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { cn } from "@/lib/utils"

const noopSubscribe = () => () => {}

/**
 * Animated light/dark switch, controlled by next-themes so the choice is
 * persisted and every `useTheme()` consumer (e.g. the toaster) stays in sync.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  // The resolved theme is only known in the browser; render a same-sized
  // placeholder until hydration to avoid an icon mismatch.
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

  const classes = cn(
    buttonVariants({ variant: "ghost", size: "icon-lg" }),
    "rounded-full",
    className,
  )

  if (!isMounted) {
    return <span className={classes} aria-hidden />
  }

  return (
    <AnimatedThemeToggler
      className={classes}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={setTheme}
      duration={500}
      aria-label={
        resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
    />
  )
}
