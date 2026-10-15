"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { MAX_QUANTITY } from "@/lib/cart/cart"

interface QuantityStepperProps {
  quantity: number
  itemName: string
  onIncrement: () => void
  onDecrement: () => void
}

export function QuantityStepper({
  quantity,
  itemName,
  onIncrement,
  onDecrement,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDecrement}
        aria-label={`Remove one ${itemName}`}
      >
        <MinusIcon />
      </Button>
      <span className="relative w-6 overflow-hidden text-center text-sm font-medium tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={quantity}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="inline-block"
            aria-live="polite"
          >
            {quantity}
          </motion.span>
        </AnimatePresence>
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onIncrement}
        disabled={quantity >= MAX_QUANTITY}
        aria-label={`Add one more ${itemName}`}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}
