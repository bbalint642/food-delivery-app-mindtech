import type { PriceLevel, RestaurantFilters } from "@/lib/api/types"

/**
 * Restaurant filters <-> URL search params. The URL is the single source of
 * truth, so filtered views are shareable and survive a reload. Parameter
 * names match the API's query parameters.
 */

/** Rating scale of the range slider; the API accepts one decimal place. */
export const RATING_MIN = 0
export const RATING_MAX = 5
export const RATING_STEP = 0.1

export const PRICE_LEVEL_OPTIONS: readonly PriceLevel[] = [1, 2, 3]

export const MAX_SEARCH_LENGTH = 100

const PRICE_LEVEL_NAMES: Record<PriceLevel, string> = {
  1: "Olcsó",
  2: "Közepes",
  3: "Drágább",
}

export function priceLevelName(level: PriceLevel): string {
  return PRICE_LEVEL_NAMES[level]
}

function isPriceLevel(value: number): value is PriceLevel {
  return (PRICE_LEVEL_OPTIONS as readonly number[]).includes(value)
}

/** A rating bound from the URL: 0.0–5.0 with at most one decimal, else undefined. */
function parseRating(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === "") return undefined
  const value = Number(raw)
  const isOneDecimal = Math.abs(value * 10 - Math.round(value * 10)) < 1e-9
  return Number.isFinite(value) &&
    value >= RATING_MIN &&
    value <= RATING_MAX &&
    isOneDecimal
    ? Math.round(value * 10) / 10
    : undefined
}

/**
 * Normalises a rating range: bounds at the scale's ends mean "no limit"
 * (so the full range is no filter at all), and an inverted range is dropped.
 */
export function normalizeRatingRange(
  min: number | undefined,
  max: number | undefined,
): Pick<RestaurantFilters, "minRating" | "maxRating"> {
  if (min !== undefined && max !== undefined && min > max) return {}
  return {
    ...(min !== undefined && min > RATING_MIN && { minRating: min }),
    ...(max !== undefined && max < RATING_MAX && { maxRating: max }),
  }
}

/** Reads filters from the URL, silently dropping invalid values. */
export function parseFilters(params: URLSearchParams): RestaurantFilters {
  const filters: RestaurantFilters = {}

  const q = params.get("q")?.trim().slice(0, MAX_SEARCH_LENGTH)
  if (q) filters.q = q

  const cuisine = [...new Set(params.getAll("cuisine").filter(Boolean))]
  if (cuisine.length) filters.cuisine = cuisine

  if (params.get("onSale") === "true") filters.onSale = true

  Object.assign(
    filters,
    normalizeRatingRange(
      parseRating(params.get("minRating")),
      parseRating(params.get("maxRating")),
    ),
  )

  const priceLevel = [...new Set(params.getAll("priceLevel").map(Number))]
    .filter(isPriceLevel)
    .sort()
  if (priceLevel.length) filters.priceLevel = priceLevel

  return filters
}

/** Writes filters to search params; empty filters produce no parameters. */
export function toSearchParams(filters: RestaurantFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  filters.cuisine?.forEach((cuisine) => params.append("cuisine", cuisine))
  if (filters.onSale) params.set("onSale", "true")
  if (filters.minRating !== undefined) {
    params.set("minRating", String(filters.minRating))
  }
  if (filters.maxRating !== undefined) {
    params.set("maxRating", String(filters.maxRating))
  }
  filters.priceLevel?.forEach((level) =>
    params.append("priceLevel", String(level)),
  )
  return params
}

/** Number of active filter groups (for the mobile "Szűrők (n)" button). */
export function countActiveFilters(filters: RestaurantFilters): number {
  return [
    filters.q,
    filters.cuisine?.length,
    filters.onSale,
    filters.minRating !== undefined || filters.maxRating !== undefined,
    filters.priceLevel?.length,
  ].filter(Boolean).length
}

/** Adds the value if missing, removes it if present. */
export function toggleValue<T>(values: readonly T[] | undefined, value: T): T[] {
  const current = values ?? []
  return current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value]
}
