"use client"

import { useQuery } from "@tanstack/react-query"
import { PercentIcon } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { queryKeys, restaurantsApi } from "@/lib/api/endpoints"
import { DealCard } from "./deal-card"

// The outline button's `dark:bg-input/30` would make the arrows nearly
// invisible on the dark promo block, so the dark fill is set explicitly.
const ARROW =
  "size-10 border-0 bg-background shadow-md ring-1 ring-black/5 hover:bg-muted dark:bg-neutral-800 dark:ring-white/15 dark:hover:bg-neutral-700 disabled:opacity-0"

/**
 * Promotional block above the restaurant list: discounted dishes in random
 * order (shuffled by the API) in a horizontally scrollable carousel.
 * Hidden when there are no deals or they cannot be loaded.
 */
export function DealsCarousel() {
  const { data: deals, isPending, isError } = useQuery({
    queryKey: queryKeys.deals,
    queryFn: () => restaurantsApi.deals(),
    // Keep one random order per visit instead of reshuffling on refetch.
    staleTime: Infinity,
  })

  if (isError || (!isPending && deals.length === 0)) return null

  return (
    <BlurFade>
      <section
        aria-labelledby="deals-heading"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50 p-4 sm:p-5 dark:from-rose-950/50 dark:via-pink-950/30 dark:to-orange-950/30"
      >
        <header className="mb-4 flex items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
            aria-hidden
          >
            <PercentIcon className="size-6" />
          </span>
          <div className="min-w-0">
            <h2 id="deals-heading" className="text-xl font-bold tracking-tight">
              Ezekkel ma spórolhatsz
            </h2>
            <p className="text-sm text-rose-700 dark:text-rose-300">
              Akciós fogások partnereinktől – minden látogatáskor más ajánlattal.
            </p>
          </div>
        </header>

        {isPending ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={index}
                className="h-56 w-[70%] shrink-0 rounded-xl bg-background/60 sm:w-[calc(33%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
              />
            ))}
          </div>
        ) : (
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps" }}
            aria-label="Akciós ételek"
          >
            <CarouselContent>
              {deals.map((deal) => (
                <CarouselItem
                  key={deal.menuItemId}
                  className="basis-[70%] sm:basis-1/3 lg:basis-1/4"
                >
                  <DealCard deal={deal} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className={`left-1 ${ARROW}`}
              aria-label="Előző ajánlatok"
            />
            <CarouselNext
              className={`right-1 ${ARROW}`}
              aria-label="További ajánlatok"
            />
          </Carousel>
        )}
      </section>
    </BlurFade>
  )
}
