"use client"

import Image from "next/image"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { MenuItem } from "@/lib/api/types"
import { MAX_QUANTITY } from "@/lib/cart/cart"
import { formatPrice } from "@/lib/format"
import { QuantityStepper } from "./quantity-stepper"

interface MenuItemDialogProps {
  item: MenuItem | null
  onClose: () => void
  onAdd: (item: MenuItem, quantity: number) => void
}

const NUTRITION = [
  { key: "caloriesKcal", label: "kcal", unit: "" },
  { key: "proteinGrams", label: "Fehérje", unit: " g" },
  { key: "carbsGrams", label: "Szénhidrát", unit: " g" },
  { key: "fatGrams", label: "Zsír", unit: " g" },
] as const

export function MenuItemDialog({ item, onClose, onAdd }: MenuItemDialogProps) {
  return (
    <Dialog
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[min(92dvh,760px)] gap-0 overflow-hidden p-0">
        {item && (
          <MenuItemDialogBody
            key={item.id}
            item={item}
            onAdd={(quantity) => onAdd(item, quantity)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function MenuItemDialogBody({
  item,
  onAdd,
}: {
  item: MenuItem
  onAdd: (quantity: number) => void
}) {
  const [quantity, setQuantity] = useState(1)

  return (
    <>
      {item.imageUrl && (
        <div className="relative h-60 shrink-0 bg-muted sm:h-72">
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="(min-width: 640px) 448px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-2 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{item.name}</DialogTitle>
            {item.isOnSale && <Badge variant="destructive">Akciós</Badge>}
            {!item.isAvailable && <Badge variant="outline">Nem elérhető</Badge>}
          </div>
          <p className="text-lg font-semibold">
            {item.isOnSale && item.compareAtPriceCents != null && (
              <span className="mr-2 text-base font-normal text-muted-foreground line-through">
                {formatPrice(item.compareAtPriceCents)}
              </span>
            )}
            {formatPrice(item.priceCents)}
          </p>
          <DialogDescription>{item.description}</DialogDescription>
        </div>

        <Separator />

        <section className="flex flex-col gap-2" aria-labelledby="allergens-heading">
          <h3 id="allergens-heading" className="font-semibold">
            Allergének
          </h3>
          {item.allergens.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {item.allergens.map((allergen) => (
                <li key={allergen}>
                  <Badge variant="secondary">{allergen}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nincs kiemelt allergén.</p>
          )}
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="nutrition-heading">
          <div>
            <h3 id="nutrition-heading" className="font-semibold">
              Tápérték
            </h3>
            <p className="text-xs text-muted-foreground">Becsült értékek egy adagra.</p>
          </div>
          <dl className="grid grid-cols-4 gap-2 rounded-xl bg-muted p-3 text-center">
            {NUTRITION.map((fact) => (
              <div key={fact.key} className="flex flex-col gap-0.5">
                <dt className="text-[0.7rem] text-muted-foreground">{fact.label}</dt>
                <dd className="text-sm font-semibold tabular-nums">
                  {item[fact.key]}
                  {fact.unit}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t p-4">
        {item.isAvailable && (
          <QuantityStepper
            quantity={quantity}
            itemName={item.name}
            decrementDisabled={quantity <= 1}
            onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
            onIncrement={() =>
              setQuantity((current) => Math.min(MAX_QUANTITY, current + 1))
            }
          />
        )}
        <Button
          size="lg"
          className="h-11 flex-1 rounded-full text-base"
          disabled={!item.isAvailable}
          onClick={() => onAdd(quantity)}
        >
          {item.isAvailable ? "Hozzáadás a kosárhoz" : "Nem elérhető"}
        </Button>
      </div>
    </>
  )
}
