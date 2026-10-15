import type { Metadata } from "next"
import { Suspense } from "react"
import { OrderDetail } from "@/components/orders/order-detail"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Order" }

type Props = PageProps<"/orders/[id]">

export default function OrderPage({ params }: Props) {
  // `params` is request-time data, so it is read behind a Suspense boundary.
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <OrderDetailFromParams params={params} />
    </Suspense>
  )
}

async function OrderDetailFromParams({ params }: Pick<Props, "params">) {
  const { id } = await params
  return <OrderDetail orderId={id} />
}
