"use client"

import { useQuery } from "@tanstack/react-query"
import { StoreIcon } from "lucide-react"
import { ErrorState, StateMessage } from "@/components/states"
import { BlurFade } from "@/components/ui/blur-fade"
import { Skeleton } from "@/components/ui/skeleton"
import { restaurantsApi, queryKeys } from "@/lib/api/endpoints"
import { getErrorMessage } from "@/lib/api/errors"
import { RestaurantCard } from "./restaurant-card"

const GRID = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"

export function RestaurantList() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.restaurants,
    queryFn: restaurantsApi.list,
  })

  if (isPending) return <RestaurantListSkeleton />
  if (isError) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    )
  }
  if (data.length === 0) {
    return (
      <StateMessage
        icon={<StoreIcon />}
        title="No restaurants yet"
        description="Check back soon – new places are on their way."
      />
    )
  }

  return (
    <ul className={GRID}>
      {data.map((restaurant, index) => (
        <li key={restaurant.id}>
          <BlurFade delay={0.05 + index * 0.06} inView className="h-full">
            <RestaurantCard restaurant={restaurant} />
          </BlurFade>
        </li>
      ))}
    </ul>
  )
}

export function RestaurantListSkeleton() {
  return (
    <ul className={GRID} aria-busy="true" aria-label="Loading restaurants">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="overflow-hidden rounded-xl border">
          <Skeleton className="h-32 rounded-none" />
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
