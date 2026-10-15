import { StarIcon } from "lucide-react"
import { formatRating } from "@/lib/format"
import { cn } from "@/lib/utils"

export function RestaurantRating({
  rating,
  className,
}: {
  rating: number
  className?: string
}) {
  const label = formatRating(rating)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
        className,
      )}
      aria-label={`Értékelés: ${label}`}
    >
      <StarIcon className="size-4 fill-amber-400 text-amber-500" aria-hidden />
      {label}
    </span>
  )
}
