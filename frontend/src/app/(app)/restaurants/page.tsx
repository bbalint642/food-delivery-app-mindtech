import type { Metadata } from "next"
import { RestaurantList } from "@/components/restaurants/restaurant-list"

export const metadata: Metadata = { title: "Restaurants" }

export default function RestaurantsPage() {
  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Restaurants</h1>
        <p className="text-muted-foreground">
          Pick a place and build your order.
        </p>
      </header>
      <RestaurantList />
    </section>
  )
}
