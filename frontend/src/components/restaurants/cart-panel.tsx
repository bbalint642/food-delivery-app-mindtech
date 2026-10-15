"use client"

import { ShoppingBagIcon, Trash2Icon } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Spinner } from "@/components/ui/spinner"
import { TextAnimate } from "@/components/ui/text-animate"
import type { CartLine } from "@/lib/cart/cart"
import { formatPrice } from "@/lib/format"
import { QuantityStepper } from "./quantity-stepper"

function CartAmount({
  cents,
  className,
}: {
  cents: number
  className?: string
}) {
  const text = formatPrice(cents)
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <span className={className}>{text}</span>
  }

  return (
    <TextAnimate
      key={text}
      as="span"
      animation="blurInUp"
      by="character"
      once
      className={className}
    >
      {text}
    </TextAnimate>
  )
}

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
        <p className="font-medium text-foreground">A kosár üres</p>
        <p className="text-sm">Válassz valami finomat az étlapról.</p>
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
                    <CartAmount cents={line.unitPriceCents * line.quantity} />
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
                    aria-label={`${line.name} törlése a kosárból`}
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
        <span className="text-sm text-muted-foreground">Összesen</span>
        <CartAmount cents={totalCents} className="text-xl font-semibold" />
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
        {isPlacingOrder ? "Rendelés leadása…" : "Rendelés leadása"}
      </ShimmerButton>
      <p className="text-center text-xs text-muted-foreground">
        Az árak a rendelés leadásakor véglegesednek.
      </p>
    </div>
  )
}
