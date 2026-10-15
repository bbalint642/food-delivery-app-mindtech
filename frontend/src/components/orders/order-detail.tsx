"use client"

import { useQuery } from "@tanstack/react-query"
import { ReceiptTextIcon, StoreIcon } from "lucide-react"
import Link from "next/link"
import { ErrorState, StateMessage } from "@/components/states"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PriceTicker } from "@/components/ui/price-ticker"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ordersApi, queryKeys } from "@/lib/api/endpoints"
import { ApiError, getErrorMessage } from "@/lib/api/errors"
import type { Order, OrderStatus } from "@/lib/api/types"
import { formatDateTime, formatOrderRef, formatPrice } from "@/lib/format"
import { ORDER_STATUS_META, statusIndex } from "@/lib/order-status"
import { OrderStatusTimeline } from "./order-status-timeline"
import { useOrderStatusStream } from "./use-order-status-stream"

export function OrderDetail({ orderId }: { orderId: string }) {
  const stream = useOrderStatusStream(orderId)
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => ordersApi.get(orderId),
  })

  if (isPending) return <OrderDetailSkeleton />
  if (isError) {
    const status = ApiError.from(error).status
    // The API answers 404 for missing orders and for other customers' orders.
    if (status === 400 || status === 404) {
      return (
        <StateMessage
          icon={<ReceiptTextIcon />}
          title="A rendelés nem található"
          description="Ez a rendelés nem létezik, vagy nem a te fiókodhoz tartozik."
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

  return <OrderSummary order={data} stream={stream} />
}

function shownStatus(order: Order, liveStatus: OrderStatus | null): OrderStatus {
  if (!liveStatus) return order.status
  return statusIndex(liveStatus) > statusIndex(order.status) ? liveStatus : order.status
}

function OrderSummary({
  order,
  stream,
}: {
  order: Order
  stream: { status: OrderStatus | null; live: boolean }
}) {
  const status = shownStatus(order, stream.status)
  return (
    <div className="flex flex-col gap-8">
      <BlurFade>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              Leadva: {formatDateTime(order.createdAt)}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Rendelés {formatOrderRef(order.id)}
            </h1>
            <Link
              href={`/restaurants/${order.restaurant.id}`}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <StoreIcon className="size-4" />
              {order.restaurant.name}
            </Link>
          </div>
          <Badge className="self-start text-sm sm:self-auto" aria-live="polite">
            {ORDER_STATUS_META[status].label}
          </Badge>
        </header>
      </BlurFade>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <BlurFade delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Tételek</CardTitle>
              <CardDescription>
                Az árak a rendelés leadásakor érvényesek.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium">
                        <span className="text-muted-foreground tabular-nums">
                          {item.quantity}×
                        </span>{" "}
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.unitPriceCents)} / db
                      </p>
                    </div>
                    <PriceTicker cents={item.lineTotalCents} />
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="font-medium">Összesen</span>
                <PriceTicker
                  cents={order.totalCents}
                  className="text-xl font-semibold"
                />
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        <BlurFade delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle>Állapot</CardTitle>
              {stream.live && status !== "DELIVERED" && (
                <CardAction>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                      <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                    Élő
                  </span>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline status={status} />
            </CardContent>
          </Card>
        </BlurFade>
      </div>

      <Button asChild variant="outline" className="self-start">
        <Link href="/restaurants">Rendelek mást</Link>
      </Button>
    </div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Rendelés betöltése">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}
