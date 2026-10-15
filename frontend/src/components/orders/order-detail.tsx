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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ordersApi, queryKeys } from "@/lib/api/endpoints"
import { ApiError, getErrorMessage } from "@/lib/api/errors"
import type { Order } from "@/lib/api/types"
import { formatDateTime, formatOrderRef, formatPrice } from "@/lib/format"
import { ORDER_STATUS_META } from "@/lib/order-status"
import { OrderStatusTimeline } from "./order-status-timeline"

export function OrderDetail({ orderId }: { orderId: string }) {
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
          title="Order not found"
          description="This order doesn't exist or doesn't belong to your account."
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

  return <OrderSummary order={data} />
}

function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-8">
      <BlurFade>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              Placed {formatDateTime(order.createdAt)}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Order {formatOrderRef(order.id)}
            </h1>
            <Link
              href={`/restaurants/${order.restaurant.id}`}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <StoreIcon className="size-4" />
              {order.restaurant.name}
            </Link>
          </div>
          <Badge className="self-start text-sm sm:self-auto">
            {ORDER_STATUS_META[order.status].label}
          </Badge>
        </header>
      </BlurFade>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <BlurFade delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                Prices as charged when the order was placed.
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
                        {formatPrice(item.unitPriceCents)} each
                      </p>
                    </div>
                    <span className="tabular-nums">
                      {formatPrice(item.lineTotalCents)}
                    </span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold tabular-nums">
                  {formatPrice(order.totalCents)}
                </span>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        <BlurFade delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline status={order.status} />
            </CardContent>
          </Card>
        </BlurFade>
      </div>

      <Button asChild variant="outline" className="self-start">
        <Link href="/restaurants">Order something else</Link>
      </Button>
    </div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading order">
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
