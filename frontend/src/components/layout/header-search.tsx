"use client"

import { usePathname, useRouter } from "next/navigation"
import { SearchField } from "@/components/restaurants/filters/search-field"
import { useRestaurantFilters } from "@/hooks/use-restaurant-filters"
import { MAX_SEARCH_LENGTH, toSearchParams } from "@/lib/restaurant-filters"

const RESTAURANTS_PATH = "/restaurants"

/**
 * Site-wide search for dish and restaurant names. On the restaurant list it
 * filters live (keeping the other filters); elsewhere Enter opens the list
 * with the search applied.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { filters, updateFilters } = useRestaurantFilters()
  const onRestaurantList = pathname === RESTAURANTS_PATH

  function apply(raw: string) {
    const q = raw.trim().slice(0, MAX_SEARCH_LENGTH) || undefined
    if (onRestaurantList) {
      updateFilters({ q })
    } else {
      const query = toSearchParams({ q }).toString()
      router.push(query ? `${RESTAURANTS_PATH}?${query}` : RESTAURANTS_PATH)
    }
  }

  return (
    <form
      role="search"
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        apply(String(new FormData(event.currentTarget).get("q") ?? ""))
      }}
    >
      <SearchField
        name="q"
        value={onRestaurantList ? filters.q : ""}
        onSearch={onRestaurantList ? apply : undefined}
        placeholder="Étel vagy étterem keresése"
        label="Keresés étel vagy étterem nevére"
      />
    </form>
  )
}
