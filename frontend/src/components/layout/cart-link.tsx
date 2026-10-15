"use client"

import { ShoppingBagIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cartItemCount } from "@/lib/cart/cart"
import {
  cartHref,
  requestOpenCart,
  useActiveCart,
} from "@/lib/cart/cart-store"

export function CartLink() {
  const cart = useActiveCart()
  const pathname = usePathname()
  const itemCount = cart ? cartItemCount(cart.cart) : 0
  const label =
    itemCount > 0
      ? `Ugrás a kosárhoz, ${itemCount} tétel`
      : "Ugrás a kosárhoz"

  function openCurrentCart() {
    if (!cart) {
      toast.message("A kosár üres", {
        description: "Válassz egy éttermet, és tedd bele, amit rendelnél.",
      })
      return
    }

    if (pathname === `/restaurants/${cart.restaurantId}`) {
      window.history.replaceState(null, "", cartHref(cart))
      requestOpenCart()
    }
  }

  const badge =
    itemCount > 0 ? (
      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    ) : null

  if (!cart) {
    return (
      <Button
        variant="ghost"
        size="icon-lg"
        className="relative"
        aria-label={label}
        onClick={openCurrentCart}
      >
        <ShoppingBagIcon />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon-lg" className="relative" asChild>
      <Link
        href={cartHref(cart)}
        aria-label={label}
        onClick={(event) => {
          if (pathname === `/restaurants/${cart.restaurantId}`) {
            event.preventDefault()
            openCurrentCart()
          }
        }}
      >
        <ShoppingBagIcon />
        {badge}
      </Link>
    </Button>
  )
}
