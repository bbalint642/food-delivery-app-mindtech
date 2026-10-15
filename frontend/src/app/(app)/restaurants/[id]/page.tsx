import type { Metadata } from "next"
import { Suspense } from "react"
import { RestaurantDetail } from "@/components/restaurants/restaurant-detail"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Étlap" }

type Props = PageProps<"/restaurants/[id]">

export default function RestaurantPage({ params }: Props) {
  // `params` is request-time data, so it is read behind a Suspense boundary.
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <RestaurantDetailFromParams params={params} />
    </Suspense>
  )
}

async function RestaurantDetailFromParams({ params }: Pick<Props, "params">) {
  const { id } = await params
  return <RestaurantDetail restaurantId={id} />
}
