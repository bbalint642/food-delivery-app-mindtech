const priceFormatter = new Intl.NumberFormat("hu-HU", {
  style: "currency",
  currency: "HUF",
  maximumFractionDigits: 0,
})

const ratingFormatter = new Intl.NumberFormat("hu-HU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** Formats a restaurant rating, e.g. 4.7 → "4,7". */
export function formatRating(rating: number): string {
  return ratingFormatter.format(rating)
}

/** Formats integer fillér, e.g. 349000 → "3 490 Ft". */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100)
}

const dateTimeFormatter = new Intl.DateTimeFormat("hu-HU", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

/** Short, human-friendly order reference derived from the UUID. */
export function formatOrderRef(orderId: string): string {
  return `#${orderId.slice(0, 8).toUpperCase()}`
}
