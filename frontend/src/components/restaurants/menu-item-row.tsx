"use client"

import { PlusIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { MenuItem } from "@/lib/api/types"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { QuantityStepper } from "./quantity-stepper"

interface MenuItemRowProps {
  item: MenuItem
  quantity: number
  onAdd: () => void
  onIncrement: () => void
  onDecrement: () => void
}

export function MenuItemRow({
  item,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: MenuItemRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors",
        quantity > 0 && "border-primary/40 bg-primary/5",
        !item.isAvailable && "opacity-60",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium">{item.name}</h3>
          {!item.isAvailable && <Badge variant="outline">Unavailable</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <p className="text-sm font-semibold">{formatPrice(item.priceCents)}</p>
      </div>
      {quantity > 0 ? (
        <QuantityStepper
          quantity={quantity}
          itemName={item.name}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      ) : (
        <Button
          variant="outline"
          onClick={onAdd}
          disabled={!item.isAvailable}
          aria-label={`Add ${item.name} to cart`}
        >
          <PlusIcon />
          Add
        </Button>
      )}
    </div>
  )
}
