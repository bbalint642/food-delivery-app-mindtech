"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeftIcon, MapPinIcon, SearchXIcon, ShoppingBagIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useReducer, useState } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ordersApi, queryKeys, restaurantsApi } from "@/lib/api/endpoints"
import { ApiError, getErrorMessage } from "@/lib/api/errors"
import type { RestaurantDetail as RestaurantDetailData } from "@/lib/api/types"
import {
  cartItemCount,
  cartReducer,
  cartTotalCents,
  emptyCart,
  quantityOf,
  toCreateOrderInput,
} from "@/lib/cart/cart"
import { cuisineStyle } from "@/lib/cuisine"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { CartPanel } from "./cart-panel"
import { MenuItemRow } from "./menu-item-row"

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
          title="Restaurant not found"
          description="It may have been removed, or the link is incorrect."
          action={
            <Button asChild variant="outline">
              <Link href="/restaurants">Back to restaurants</Link>
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
  // Local state is enough: the cart belongs to this restaurant page only.
  const [cart, dispatch] = useReducer(cartReducer, emptyCart)
  const [isCartSheetOpen, setCartSheetOpen] = useState(false)

  const totalCents = cartTotalCents(cart)
  const itemCount = cartItemCount(cart)

  const placeOrder = useMutation({
    mutationFn: () => ordersApi.create(toCreateOrderInput(restaurant.id, cart)),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.order(order.id), order)
      toast.success("Order placed!")
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
      <Button asChild variant="ghost" className="-ml-2 self-start">
        <Link href="/restaurants">
          <ArrowLeftIcon />
          All restaurants
        </Link>
      </Button>

      <BlurFade>
        <header
          className={cn(
            "flex flex-col gap-4 rounded-2xl bg-gradient-to-br p-6 sm:flex-row sm:items-center sm:p-8",
            gradient,
          )}
        >
          <span className="text-6xl" aria-hidden>
            {emoji}
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {restaurant.name}
              </h1>
              <Badge variant="secondary">{restaurant.cuisine}</Badge>
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
            Menu
          </h2>
          {restaurant.menu.length === 0 ? (
            <p className="text-muted-foreground">This menu is empty for now.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {restaurant.menu.map((item, index) => (
                <li key={item.id}>
                  <BlurFade delay={0.05 + index * 0.04}>
                    <MenuItemRow
                      item={item}
                      quantity={quantityOf(cart, item.id)}
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
        <Card className="sticky top-24 hidden lg:flex">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBagIcon className="size-5" />
              Your order
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
              View cart ({itemCount})
            </span>
            <span>{formatPrice(totalCents)}</span>
          </Button>
        </div>
      )}
      <Sheet open={isCartSheetOpen} onOpenChange={setCartSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Your order</SheetTitle>
            <SheetDescription>{restaurant.name}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">{cartPanel}</div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function RestaurantDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading restaurant">
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
