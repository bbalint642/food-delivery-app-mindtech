"use client"

import { ShoppingBagIcon, Trash2Icon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Separator } from "@/components/ui/separator"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Spinner } from "@/components/ui/spinner"
import type { CartLine } from "@/lib/cart/cart"
import { formatPrice } from "@/lib/format"
import { QuantityStepper } from "./quantity-stepper"

interface CartPanelProps {
  lines: CartLine[]
  totalCents: number
  isPlacingOrder: boolean
  onIncrement: (menuItemId: string) => void
  onDecrement: (menuItemId: string) => void
  onRemove: (menuItemId: string) => void
  onPlaceOrder: () => void
}

export function CartPanel({
  lines,
  totalCents,
  isPlacingOrder,
  onIncrement,
  onDecrement,
  onRemove,
  onPlaceOrder,
}: CartPanelProps) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
        <ShoppingBagIcon className="size-10" />
        <p className="font-medium text-foreground">Your cart is empty</p>
        <p className="text-sm">Add something tasty from the menu.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.li
              key={line.menuItemId}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{line.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(line.unitPriceCents * line.quantity)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <QuantityStepper
                    quantity={line.quantity}
                    itemName={line.name}
                    onIncrement={() => onIncrement(line.menuItemId)}
                    onDecrement={() => onDecrement(line.menuItemId)}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemove(line.menuItemId)}
                    aria-label={`Remove ${line.name} from cart`}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <Separator />

      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-xl font-semibold" aria-label={formatPrice(totalCents)}>
          €<NumberTicker value={totalCents / 100} decimalPlaces={2} className="tracking-normal" />
        </span>
      </div>

      <ShimmerButton
        type="button"
        onClick={onPlaceOrder}
        disabled={isPlacingOrder}
        background="var(--primary)"
        shimmerColor="#fff7ed"
        borderRadius="0.75rem"
        className="w-full gap-2 py-3 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPlacingOrder && <Spinner />}
        {isPlacingOrder ? "Placing order…" : "Place Order"}
      </ShimmerButton>
      <p className="text-center text-xs text-muted-foreground">
        Prices are confirmed when your order is placed.
      </p>
    </div>
  )
}
