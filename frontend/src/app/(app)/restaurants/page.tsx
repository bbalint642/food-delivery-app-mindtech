import type { Metadata } from "next"
import { Suspense } from "react"
import { DealsCarousel } from "@/components/restaurants/deals/deals-carousel"
import { MobileFilterSheet } from "@/components/restaurants/filters/mobile-filter-sheet"
import { RestaurantFilterPanel } from "@/components/restaurants/filters/restaurant-filter-panel"
import {
  RestaurantList,
  RestaurantListSkeleton,
} from "@/components/restaurants/restaurant-list"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Éttermek" }

export default function RestaurantsPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Desktop sidebar; below `lg` the same panel opens in a sheet. */}
      <aside className="hidden lg:block" aria-label="Szűrők">
        <div className="sticky top-24 rounded-2xl border bg-card p-5">
          {/* Filters read the URL (request-time data), so they stream in. */}
          <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
            <RestaurantFilterPanel />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-10">
        <DealsCarousel />

        <section className="flex flex-col gap-6" aria-labelledby="restaurants-heading">
          <header className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1
                id="restaurants-heading"
                className="text-3xl font-semibold tracking-tight"
              >
                Éttermek
              </h1>
              <p className="text-muted-foreground">
                Válassz egy helyet, és állítsd össze a rendelésed.
              </p>
            </div>
            <Suspense fallback={null}>
              <MobileFilterSheet />
            </Suspense>
          </header>

          <Suspense fallback={<RestaurantListSkeleton />}>
            <RestaurantList />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
