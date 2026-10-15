"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MapPinIcon, SearchXIcon, ShoppingBagIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { ErrorState, StateMessage } from "@/components/states"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { PriceTicker } from "@/components/ui/price-ticker"
import { Skeleton } from "@/components/ui/skeleton"
import { ordersApi, queryKeys, restaurantsApi } from "@/lib/api/endpoints"
import { ApiError, getErrorMessage } from "@/lib/api/errors"
import type { MenuItem, RestaurantDetail as RestaurantDetailData } from "@/lib/api/types"
import {
  cartItemCount,
  cartTotalCents,
  emptyCart,
  quantityOf,
  toCreateOrderInput,
  type CartAction,
} from "@/lib/cart/cart"
import {
  clearCart,
  subscribeOpenCart,
  updateRestaurantCart,
  useActiveCart,
} from "@/lib/cart/cart-store"
import { cuisineStyle } from "@/lib/cuisine"
import { cn } from "@/lib/utils"
import { CartPanel } from "./cart-panel"
import { MenuItemDialog } from "./menu-item-dialog"
import { MenuItemRow } from "./menu-item-row"
import { RestaurantBreadcrumb } from "./restaurant-breadcrumb"
import { RestaurantRating } from "./restaurant-rating"

export function RestaurantDetail({ restaurantId }: { restaurantId: string }) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.restaurant(restaurantId),
    queryFn: () => restaurantsApi.get(restaurantId),
  })

  if (isPending) return <RestaurantDetailSkeleton />
  if (isError) {
    const status = ApiError.from(error).status
    // 400 = malformed id, 404 = unknown restaurant
    if (status === 400 || status === 404) {
      return (
        <StateMessage
          icon={<SearchXIcon />}
          title="Az étterem nem található"
          description="Lehet, hogy törölték, vagy a link hibás."
          action={
            <Button asChild variant="outline">
              <Link href="/restaurants">Vissza az éttermekhez</Link>
            </Button>
          }
        />
      )
    }
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
  }

  return <RestaurantMenu restaurant={data} />
}

function RestaurantMenu({ restaurant }: { restaurant: RestaurantDetailData }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const activeCart = useActiveCart()
  const cart =
    activeCart?.restaurantId === restaurant.id ? activeCart.cart : emptyCart
  const [isCartSheetOpen, setCartSheetOpen] = useState(false)
  const [openItem, setOpenItem] = useState<MenuItem | null>(null)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)

  const dispatch = useCallback(
    (action: CartAction) => {
      const { replacedRestaurantName } = updateRestaurantCart(restaurant, action)
      if (replacedRestaurantName) {
        toast.message("Új kosarat kezdtél", {
          description: `A ${replacedRestaurantName} kosara helyett ennél az étteremnél folytatod.`,
        })
      }
    },
    [restaurant],
  )

  const revealCart = useCallback(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches
    if (isDesktop) {
      document.getElementById("cart")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
      return
    }
    setCartSheetOpen(true)
  }, [])

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#cart") revealCart()
    }
    openFromHash()
    const unsubscribe = subscribeOpenCart(revealCart)
    window.addEventListener("hashchange", openFromHash)
    return () => {
      unsubscribe()
      window.removeEventListener("hashchange", openFromHash)
    }
  }, [revealCart])

  useEffect(() => {
    const itemId = menuItemIdFromHash()
    if (!itemId || !restaurant.menu.some((item) => item.id === itemId)) return

    setHighlightedItemId(itemId)
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(`item-${itemId}`)
      if (!element) return
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      element.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [restaurant.menu])

  const totalCents = cartTotalCents(cart)
  const itemCount = cartItemCount(cart)

  const placeOrder = useMutation({
    mutationFn: () => ordersApi.create(toCreateOrderInput(restaurant.id, cart)),
    onSuccess: (order) => {
      clearCart()
      queryClient.setQueryData(queryKeys.order(order.id), order)
      toast.success("Rendelés leadva!")
      router.push(`/orders/${order.id}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
      // e.g. an item became unavailable: refresh the menu to show it.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.restaurant(restaurant.id),
      })
    },
  })

  // Keep the button disabled until navigation completes after success.
  const isPlacingOrder = placeOrder.isPending || placeOrder.isSuccess

  const cartPanel = (
    <CartPanel
      lines={cart.lines}
      totalCents={totalCents}
      isPlacingOrder={isPlacingOrder}
      onIncrement={(menuItemId) => dispatch({ type: "increment", menuItemId })}
      onDecrement={(menuItemId) => dispatch({ type: "decrement", menuItemId })}
      onRemove={(menuItemId) => dispatch({ type: "remove", menuItemId })}
      onPlaceOrder={() => placeOrder.mutate()}
    />
  )

  const { emoji, gradient } = cuisineStyle(restaurant.cuisine)

  return (
    <div className="flex flex-col gap-8 pb-24 lg:pb-0">
      <RestaurantBreadcrumb name={restaurant.name} cuisine={restaurant.cuisine} />

      <BlurFade>
        <header className="overflow-hidden rounded-2xl border bg-card">
          <div
            className={cn(
              "relative aspect-[16/7] w-full",
              !restaurant.imageUrl && "flex aspect-auto h-28 items-center justify-center bg-gradient-to-br",
              !restaurant.imageUrl && gradient,
            )}
          >
            {restaurant.imageUrl ? (
              <Image
                src={restaurant.imageUrl}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 720px, 100vw"
                className="object-cover"
              />
            ) : (
              <span className="text-6xl" aria-hidden>
                {emoji}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {restaurant.name}
              </h1>
              <Badge variant="secondary">{restaurant.cuisine}</Badge>
              <RestaurantRating rating={restaurant.rating} />
            </div>
            <p className="text-muted-foreground">{restaurant.description}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="size-4" />
              {restaurant.address}
            </p>
          </div>
        </header>
      </BlurFade>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-4" aria-labelledby="menu-heading">
          <h2 id="menu-heading" className="text-xl font-semibold">
            Étlap
          </h2>
          {restaurant.menu.length === 0 ? (
            <p className="text-muted-foreground">Az étlap egyelőre üres.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {restaurant.menu.map((item, index) => (
                <li key={item.id} id={`item-${item.id}`} className="h-full scroll-mt-28">
                  <BlurFade delay={0.05 + index * 0.04} className="h-full">
                    <MenuItemRow
                      item={item}
                      quantity={quantityOf(cart, item.id)}
                      highlighted={item.id === highlightedItemId}
                      onOpen={() => setOpenItem(item)}
                      onAdd={() => dispatch({ type: "add", item })}
                      onIncrement={() =>
                        dispatch({ type: "increment", menuItemId: item.id })
                      }
                      onDecrement={() =>
                        dispatch({ type: "decrement", menuItemId: item.id })
                      }
                    />
                  </BlurFade>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Desktop: sticky cart */}
        <Card id="cart" tabIndex={-1} className="sticky top-24 hidden scroll-mt-24 outline-none lg:flex">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBagIcon className="size-5" />
              A rendelésed
            </CardTitle>
          </CardHeader>
          <CardContent>{cartPanel}</CardContent>
        </Card>
      </div>

      {/* Mobile: bottom bar opening the cart sheet */}
      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 p-4 backdrop-blur lg:hidden">
          <Button
            size="lg"
            className="h-12 w-full justify-between text-base"
            onClick={() => setCartSheetOpen(true)}
          >
            <span className="flex items-center gap-2">
              <ShoppingBagIcon />
              Kosár ({itemCount})
            </span>
            <PriceTicker cents={totalCents} />
          </Button>
        </div>
      )}
      <MenuItemDialog
        item={openItem}
        onClose={() => setOpenItem(null)}
        onAdd={(item, quantity) => {
          dispatch({ type: "add", item, quantity })
          setOpenItem(null)
        }}
      />
      <Sheet open={isCartSheetOpen} onOpenChange={setCartSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>A rendelésed</SheetTitle>
            <SheetDescription>{restaurant.name}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">{cartPanel}</div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function menuItemIdFromHash() {
  const hash = window.location.hash
  if (!hash.startsWith("#item-")) return null
  try {
    return decodeURIComponent(hash.slice("#item-".length))
  } catch {
    return null
  }
}

function RestaurantDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Étterem betöltése">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="hidden h-64 rounded-xl lg:block" />
      </div>
    </div>
  )
}
