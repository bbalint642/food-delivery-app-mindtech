const priceFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
})

/** Formats integer cents, e.g. 1190 → "€11.90". */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100)
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
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
