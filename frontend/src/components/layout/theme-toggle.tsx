"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { cn } from "@/lib/utils"
import { ThemeSwitchArt } from "./theme-switch-art"

const noopSubscribe = () => () => {}

/**
 * Illustrated day/night pill switch, controlled by next-themes so the choice is
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
    "relative inline-block h-8 w-[72px] shrink-0 cursor-pointer overflow-hidden rounded-full outline-none ring-1 ring-black/10 transition-shadow focus-visible:ring-3 focus-visible:ring-ring/60 dark:ring-white/10",
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
      role="switch"
      aria-checked={resolvedTheme === "dark"}
      renderIcon={(isDark) => <ThemeSwitchArt isDark={isDark} />}
      aria-label={
        resolvedTheme === "dark" ? "Váltás világos témára" : "Váltás sötét témára"
      }
    />
  )
}
