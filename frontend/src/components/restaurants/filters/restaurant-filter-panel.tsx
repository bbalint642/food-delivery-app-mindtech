"use client"

import { useQuery } from "@tanstack/react-query"
import { TagIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useRestaurantFilters } from "@/hooks/use-restaurant-filters"
import { queryKeys, restaurantsApi } from "@/lib/api/endpoints"
import {
  countActiveFilters,
  PRICE_LEVEL_OPTIONS,
  priceLevelName,
  toggleValue,
} from "@/lib/restaurant-filters"
import { PriceLevelIcons } from "../price-level-icons"
import { FilterChip } from "./filter-chip"
import { RatingRangeFilter } from "./rating-range-filter"

function FilterSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  )
}

/**
 * Filters for the restaurant list; state lives in the URL. Free-text search
 * is in the site header, so it is available on every page.
 */
export function RestaurantFilterPanel() {
  const { filters, setFilters, updateFilters } = useRestaurantFilters()

  const cuisinesQuery = useQuery({
    queryKey: queryKeys.cuisines,
    queryFn: restaurantsApi.cuisines,
    staleTime: 5 * 60_000,
  })

  // The search term is shown in the header, so it does not count here.
  const activeCount = countActiveFilters({ ...filters, q: undefined })

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Szűrők</h2>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            // Resets the sidebar only; the search term belongs to the header.
            onClick={() => setFilters({ q: filters.q })}
          >
            <XIcon />
            Törlés
          </Button>
        )}
      </div>

      <FilterSection title="Konyhatípus">
        {cuisinesQuery.isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-5 w-32" />
            ))}
          </div>
        ) : cuisinesQuery.isError ? (
          <p className="text-sm text-muted-foreground">
            A konyhatípusok nem tölthetők be.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cuisinesQuery.data.map(({ cuisine, count }) => {
              const id = `cuisine-${cuisine}`
              return (
                <li key={cuisine} className="flex items-center gap-3">
                  <Checkbox
                    id={id}
                    checked={filters.cuisine?.includes(cuisine) ?? false}
                    onCheckedChange={() =>
                      updateFilters({
                        cuisine: toggleValue(filters.cuisine, cuisine),
                      })
                    }
                  />
                  <Label htmlFor={id} className="flex-1 font-normal">
                    {cuisine}
                  </Label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </FilterSection>

      <FilterSection title="Ajánlatok">
        <div className="flex items-center gap-3">
          <Checkbox
            id="filter-on-sale"
            checked={filters.onSale ?? false}
            onCheckedChange={(checked) =>
              updateFilters({ onSale: checked === true || undefined })
            }
          />
          <Label htmlFor="filter-on-sale" className="flex-1 font-normal">
            <TagIcon className="size-4 text-primary" aria-hidden />
            Akciós ételek
          </Label>
        </div>
      </FilterSection>

      <FilterSection title="Értékelés">
        <RatingRangeFilter
          // Re-mount when the range changes from outside (e.g. "Törlés").
          key={`${filters.minRating ?? "min"}-${filters.maxRating ?? "max"}`}
          minRating={filters.minRating}
          maxRating={filters.maxRating}
          onChange={updateFilters}
        />
      </FilterSection>

      <FilterSection title="Ár">
        <div className="flex flex-wrap gap-2">
          {PRICE_LEVEL_OPTIONS.map((level) => (
            <FilterChip
              key={level}
              pressed={filters.priceLevel?.includes(level) ?? false}
              title={priceLevelName(level)}
              aria-label={`Árkategória: ${priceLevelName(level)}`}
              className="min-w-14"
              onClick={() =>
                updateFilters({
                  priceLevel: toggleValue(filters.priceLevel, level).sort(),
                })
              }
            >
              <PriceLevelIcons level={level} />
            </FilterChip>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}
