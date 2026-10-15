"use client"

import { ArrowRightIcon, MapPinIcon, TagIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MagicCard } from "@/components/ui/magic-card"
import type { RestaurantListItem } from "@/lib/api/types"
import { cuisineStyle } from "@/lib/cuisine"
import { cn } from "@/lib/utils"
import { PriceLevelIcons } from "./price-level-icons"
import { RestaurantRating } from "./restaurant-rating"

export function RestaurantCard({
  restaurant,
}: {
  restaurant: RestaurantListItem
}) {
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
            "relative h-40 overflow-hidden",
            !restaurant.imageUrl && "flex items-center justify-center bg-gradient-to-br",
            !restaurant.imageUrl && gradient,
          )}
        >
          {restaurant.imageUrl ? (
            <Image
              src={restaurant.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <span className="text-6xl" aria-hidden>
              {emoji}
            </span>
          )}
          {restaurant.hasDeals && (
            // Solid fill: the translucent destructive variant is unreadable on photos.
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-sm">
              <TagIcon aria-hidden />
              Akciós
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold leading-tight">
              {restaurant.name}
            </h2>
            <Badge variant="secondary">{restaurant.cuisine}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RestaurantRating rating={restaurant.rating} />
            {restaurant.priceLevel !== null && (
              <>
                <span className="text-muted-foreground" aria-hidden>
                  •
                </span>
                <PriceLevelIcons
                  level={restaurant.priceLevel}
                  className="text-muted-foreground"
                />
              </>
            )}
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
