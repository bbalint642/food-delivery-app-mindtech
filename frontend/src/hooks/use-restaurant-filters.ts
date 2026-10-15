"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef } from "react"
import type { RestaurantFilters } from "@/lib/api/types"
import { parseFilters, toSearchParams } from "@/lib/restaurant-filters"

/**
 * Restaurant filters backed by the URL. Updates use `replace` (no history
 * entry per click) and keep the scroll position.
 */
export function useRestaurantFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  )

  // Delayed callers (the debounced search) must patch the latest filters,
  // not the ones captured when they were scheduled.
  const latest = useRef(filters)
  useEffect(() => {
    latest.current = filters
  }, [filters])

  const setFilters = useCallback(
    (next: RestaurantFilters) => {
      latest.current = next
      const query = toSearchParams(next).toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router],
  )

  const updateFilters = useCallback(
    (patch: Partial<RestaurantFilters>) =>
      setFilters({ ...latest.current, ...patch }),
    [setFilters],
  )

  const clearFilters = useCallback(() => setFilters({}), [setFilters])

  return { filters, setFilters, updateFilters, clearFilters }
}
