import { DollarSignIcon } from "lucide-react"
import type { PriceLevel } from "@/lib/api/types"
import { priceLevelName } from "@/lib/restaurant-filters"
import { cn } from "@/lib/utils"

/**
 * The familiar $ / $$ / $$$ price scale drawn with lucide icons. The icons
 * are decorative; the accessible name is the level's word ("Olcsó", …).
 */
export function PriceLevelIcons({
  level,
  className,
}: {
  level: PriceLevel
  className?: string
}) {
  return (
    <span
      role="img"
      aria-label={`Árkategória: ${priceLevelName(level)}`}
      title={priceLevelName(level)}
      className={cn("inline-flex items-center -space-x-1", className)}
    >
      {Array.from({ length: level }, (_, index) => (
        <DollarSignIcon key={index} className="size-3.5" aria-hidden />
      ))}
    </span>
  )
}
