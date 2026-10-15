"use client"

import { SearchIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MAX_SEARCH_LENGTH } from "@/lib/restaurant-filters"
import { cn } from "@/lib/utils"

const DEBOUNCE_MS = 300

interface SearchFieldProps {
  /** The search term currently applied (from the URL). */
  value?: string
  /** Called with the settled (debounced, trimmed) value while typing. */
  onSearch?: (value: string) => void
  name?: string
  placeholder?: string
  label?: string
  className?: string
}

/**
 * Uncontrolled search box: typing stays local and only the settled value
 * (after a short pause) is reported, so not every keystroke triggers a
 * request. When the applied term changes from outside (e.g. "clear
 * filters") and the user is not typing, the box follows it.
 */
export function SearchField({
  value = "",
  onSearch,
  name,
  placeholder = "Keress valami finomat",
  label = "Keresés",
  className,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const input = inputRef.current
    if (!input || document.activeElement === input) return
    if (input.value.trim() !== value) input.value = value
  }, [value])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        name={name}
        defaultValue={value}
        maxLength={MAX_SEARCH_LENGTH}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 rounded-full bg-muted/60 pl-9"
        onChange={(event) => {
          if (!onSearch) return
          const next = event.currentTarget.value
          if (timer.current) clearTimeout(timer.current)
          timer.current = setTimeout(() => onSearch(next.trim()), DEBOUNCE_MS)
        }}
      />
    </div>
  )
}
