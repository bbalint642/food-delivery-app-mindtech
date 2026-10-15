import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { toSearchParams } from "@/lib/restaurant-filters"

const LINK =
  "font-medium text-foreground underline decoration-foreground/40 underline-offset-4 hover:decoration-primary hover:text-primary"

/**
 * "Éttermek › Olasz › Bella Napoli": back to the full list, to the list
 * filtered by this cuisine, and the current restaurant.
 */
export function RestaurantBreadcrumb({
  name,
  cuisine,
}: {
  name: string
  cuisine: string
}) {
  const cuisineHref = `/restaurants?${toSearchParams({ cuisine: [cuisine] })}`

  return (
    <Breadcrumb aria-label="Navigációs útvonal">
      <BreadcrumbList className="text-base">
        <BreadcrumbItem>
          <BreadcrumbLink asChild className={LINK}>
            <Link href="/restaurants">Éttermek</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild className={LINK}>
            <Link href={cuisineHref}>{cuisine}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="truncate">{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
