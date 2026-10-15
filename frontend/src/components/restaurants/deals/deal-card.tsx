import Image from "next/image"
import Link from "next/link"
import type { Deal } from "@/lib/api/types"
import { cuisineStyle } from "@/lib/cuisine"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { RestaurantRating } from "../restaurant-rating"

/** A discounted dish; opens the restaurant and scrolls to this item. */
export function DealCard({ deal }: { deal: Deal }) {
  const { emoji, gradient } = cuisineStyle(deal.restaurant.cuisine)

  return (
    <Link
      href={`/restaurants/${deal.restaurant.id}#item-${encodeURIComponent(deal.menuItemId)}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-black/5 transition-shadow outline-none hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/60 dark:ring-white/10"
      aria-label={`${deal.name}, ${deal.restaurant.name}: ${formatPrice(deal.priceCents)} ${formatPrice(deal.compareAtPriceCents)} helyett`}
    >
      <div
        className={cn(
          "relative h-32 overflow-hidden",
          !deal.imageUrl && "flex items-center justify-center bg-gradient-to-br",
          !deal.imageUrl && gradient,
        )}
      >
        {deal.imageUrl ? (
          <Image
            src={deal.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 70vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="text-5xl" aria-hidden>
            {emoji}
          </span>
        )}
        <span className="absolute top-2 left-2 rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground shadow-sm">
          −{deal.discountPercent}%
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{deal.name}</h3>
          <RestaurantRating
            rating={deal.restaurant.rating}
            className="shrink-0 text-xs [&_svg]:size-3.5"
          />
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {deal.restaurant.name} • {deal.restaurant.cuisine}
        </p>
        <p className="mt-auto flex items-baseline gap-1.5 pt-1">
          <span className="font-semibold text-primary">
            {formatPrice(deal.priceCents)}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(deal.compareAtPriceCents)}
          </span>
        </p>
      </div>
    </Link>
  )
}
