"use client"

import { NumberTicker } from "@/components/ui/number-ticker"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Forint amount that counts toward its value. The accessible name is the final price. */
export function PriceTicker({
  cents,
  className,
}: {
  cents: number
  className?: string
}) {
  return (
    <span className={cn("inline-block", className)} aria-label={formatPrice(cents)}>
      <NumberTicker
        value={cents / 100}
        decimalPlaces={0}
        locale="hu-HU"
        aria-hidden
        className="tracking-normal"
      />
      <span aria-hidden>{"\u00a0Ft"}</span>
    </span>
  )
}
