/** Fallback visual identity when a restaurant has no photo. */
const CUISINE_STYLES: Record<string, { emoji: string; gradient: string }> = {
  olasz: { emoji: "🍕", gradient: "from-red-500/25 via-orange-400/15 to-amber-300/10" },
  japán: { emoji: "🍜", gradient: "from-rose-500/25 via-pink-400/15 to-orange-300/10" },
  amerikai: { emoji: "🍔", gradient: "from-amber-500/25 via-yellow-400/15 to-orange-300/10" },
  egészséges: { emoji: "🥗", gradient: "from-emerald-500/25 via-lime-400/15 to-teal-300/10" },
}

const FALLBACK = { emoji: "🍽️", gradient: "from-primary/25 via-primary/10 to-transparent" }

export function cuisineStyle(cuisine: string) {
  return CUISINE_STYLES[cuisine.toLowerCase()] ?? FALLBACK
}
