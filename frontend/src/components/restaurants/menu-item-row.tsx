"use client"

import { PlusIcon } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { MenuItem } from "@/lib/api/types"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { QuantityStepper } from "./quantity-stepper"

interface MenuItemRowProps {
  item: MenuItem
  quantity: number
  highlighted?: boolean
  onOpen: () => void
  onAdd: () => void
  onIncrement: () => void
  onDecrement: () => void
}

export function MenuItemRow({
  item,
  quantity,
  highlighted = false,
  onOpen,
  onAdd,
  onIncrement,
  onDecrement,
}: MenuItemRowProps) {
  return (
    <article
      className={cn(
        "relative flex h-full items-center gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/40",
        quantity > 0 && "border-primary/40 bg-primary/5",
        highlighted &&
          "border-primary animate-menu-highlight motion-reduce:animate-none motion-reduce:ring-2 motion-reduce:ring-primary",
        !item.isAvailable && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`${item.name} részletei`}
      />
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="line-clamp-2 font-semibold leading-snug">{item.name}</h3>
          {item.isOnSale && <Badge variant="destructive">Akciós</Badge>}
          {!item.isAvailable && <Badge variant="outline">Nem elérhető</Badge>}
        </div>
        <p className="text-sm font-semibold">
          {item.isOnSale && item.compareAtPriceCents != null && (
            <span className="mr-1.5 font-normal text-muted-foreground line-through">
              {formatPrice(item.compareAtPriceCents)}
            </span>
          )}
          {formatPrice(item.priceCents)}
        </p>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {item.description}
        </p>
      </div>

      <div
        className={cn(
          "pointer-events-none relative z-10 shrink-0",
          item.imageUrl ? "size-28" : "self-end",
        )}
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="112px"
            className="rounded-xl object-cover"
          />
        )}
        <div
          className={cn(
            "pointer-events-auto relative z-20",
            item.imageUrl && "absolute",
            item.imageUrl && (quantity > 0 ? "right-0 -bottom-1" : "-bottom-1 -left-1"),
          )}
        >
          {quantity > 0 ? (
            <QuantityStepper
              quantity={quantity}
              itemName={item.name}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              className="rounded-full bg-background shadow-sm"
            />
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={onAdd}
              disabled={!item.isAvailable}
              aria-label={`${item.name} a kosárba`}
              className="size-8 rounded-full bg-background shadow-sm"
            >
              <PlusIcon />
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
