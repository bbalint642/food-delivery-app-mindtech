"use client"

import { SlidersHorizontalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useRestaurantFilters } from "@/hooks/use-restaurant-filters"
import { countActiveFilters } from "@/lib/restaurant-filters"
import { RestaurantFilterPanel } from "./restaurant-filter-panel"

/** Below `lg` the sidebar is replaced by a button opening it in a sheet. */
export function MobileFilterSheet() {
  const { filters } = useRestaurantFilters()
  const activeCount = countActiveFilters(filters)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full lg:hidden">
          <SlidersHorizontalIcon />
          Szűrők
          {activeCount > 0 && (
            <span className="ml-0.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      {/* Extra top padding keeps the panel's "Törlés" clear of the close button. */}
      <SheetContent side="left" className="overflow-y-auto p-6 pt-14">
        <SheetTitle className="sr-only">Szűrők</SheetTitle>
        <SheetDescription className="sr-only">
          Szűkítsd az éttermek listáját konyhatípus, akció, értékelés és ár
          szerint.
        </SheetDescription>
        <RestaurantFilterPanel />
      </SheetContent>
    </Sheet>
  )
}
