"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { SearchXIcon, StoreIcon } from "lucide-react"
import { ErrorState, StateMessage } from "@/components/states"
import { BlurFade } from "@/components/ui/blur-fade"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRestaurantFilters } from "@/hooks/use-restaurant-filters"
import { restaurantsApi, queryKeys } from "@/lib/api/endpoints"
import { getErrorMessage } from "@/lib/api/errors"
import { countActiveFilters } from "@/lib/restaurant-filters"
import { cn } from "@/lib/utils"
import { RestaurantCard } from "./restaurant-card"

const GRID = "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"

/** Restaurants matching the filters in the URL. */
export function RestaurantList() {
  const { filters, clearFilters } = useRestaurantFilters()
  const hasFilters = countActiveFilters(filters) > 0

  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useQuery({
      queryKey: queryKeys.restaurants(filters),
      queryFn: () => restaurantsApi.list(filters),
      // Keep showing the previous results while a new filter loads.
      placeholderData: keepPreviousData,
    })

  if (isPending) return <RestaurantListSkeleton />
  if (isError) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    )
  }
  if (data.length === 0) {
    return hasFilters ? (
      <StateMessage
        icon={<SearchXIcon />}
        title="Nincs a szűrésnek megfelelő étterem"
        description="Próbálj kevesebb szűrőt, vagy keress másra."
        action={
          <Button variant="outline" onClick={clearFilters}>
            Szűrők törlése
          </Button>
        }
      />
    ) : (
      <StateMessage
        icon={<StoreIcon />}
        title="Még nincs étterem"
        description="Nézz vissza később, hamarosan új helyek érkeznek."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {data.length} étterem
      </p>
      <ul
        className={cn(GRID, "transition-opacity", isPlaceholderData && "opacity-60")}
        aria-busy={isPlaceholderData}
      >
        {data.map((restaurant, index) => (
          <li key={restaurant.id}>
            <BlurFade delay={0.05 + index * 0.06} inView className="h-full">
              <RestaurantCard restaurant={restaurant} />
            </BlurFade>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RestaurantListSkeleton() {
  return (
    <ul className={GRID} aria-busy="true" aria-label="Éttermek betöltése">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="overflow-hidden rounded-xl border">
          <Skeleton className="h-40 rounded-none" />
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  )
}
