import type { Metadata } from "next"

export const metadata: Metadata = { title: "Restaurants" }

// Placeholder: the restaurant list is implemented in the next step.
export default function RestaurantsPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">Restaurants</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </section>
  )
}
