"use client"

import { ArrowRightIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MagicCard } from "@/components/ui/magic-card"
import type { Restaurant } from "@/lib/api/types"
import { cuisineStyle } from "@/lib/cuisine"
import { cn } from "@/lib/utils"

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const { emoji, gradient } = cuisineStyle(restaurant.cuisine)

  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MagicCard
        className="h-full overflow-hidden rounded-xl"
        gradientColor="color-mix(in oklch, var(--primary) 18%, transparent)"
      >
        <div
          className={cn(
            "flex h-32 items-center justify-center bg-gradient-to-br",
            gradient,
          )}
        >
          <span
            className="text-6xl transition-transform duration-300 ease-out group-hover:scale-110"
            aria-hidden
          >
            {emoji}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold leading-tight">
              {restaurant.name}
            </h2>
            <Badge variant="secondary">{restaurant.cuisine}</Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {restaurant.description}
          </p>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <MapPinIcon className="size-4 shrink-0" />
              <span className="truncate">{restaurant.address}</span>
            </span>
            <ArrowRightIcon className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </MagicCard>
    </Link>
  )
}
