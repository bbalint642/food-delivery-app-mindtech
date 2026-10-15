/**
 * Types mirroring the backend DTOs (see Swagger at /api/docs).
 * All monetary amounts are integer cents.
 */

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: "Bearer"
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface Restaurant {
  id: string
  name: string
  description: string
  cuisine: string
  /** Guest rating between 0.0 and 5.0, one decimal place. */
  rating: number
  address: string
  imageUrl: string | null
}

/** 1 = cheapest … 3 = most expensive, derived from the average menu price. */
export type PriceLevel = 1 | 2 | 3

/** A restaurant in the list, with values derived from its menu. */
export interface RestaurantListItem extends Restaurant {
  /** Null when nothing on the menu can be ordered. */
  priceLevel: PriceLevel | null
  /** True when at least one orderable item is on sale. */
  hasDeals: boolean
}

/** Optional filters of `GET /restaurants`, combined with AND. */
export interface RestaurantFilters {
  q?: string
  cuisine?: string[]
  onSale?: boolean
  /** Inclusive rating range bounds (0.0–5.0, one decimal). */
  minRating?: number
  maxRating?: number
  priceLevel?: PriceLevel[]
}

export interface CuisineFacet {
  cuisine: string
  count: number
}

/** A discounted dish for the deals carousel. */
export interface Deal {
  menuItemId: string
  name: string
  imageUrl: string | null
  priceCents: number
  compareAtPriceCents: number
  discountPercent: number
  restaurant: { id: string; name: string; cuisine: string; rating: number }
}

export interface MenuItem {
  id: string
  name: string
  description: string
  priceCents: number
  isAvailable: boolean
  isOnSale: boolean
  /** List price in fillér before the discount. Null when the item is not on sale. */
  compareAtPriceCents: number | null
  imageUrl: string | null
  /** EU major allergens present in the dish. */
  allergens: string[]
  /** Estimated kcal per serving. */
  caloriesKcal: number
  /** Estimated protein grams per serving. */
  proteinGrams: number
  /** Estimated carbohydrate grams per serving. */
  carbsGrams: number
  /** Estimated fat grams per serving. */
  fatGrams: number
}

export interface RestaurantDetail extends Restaurant {
  menu: MenuItem[]
}

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "DELIVERING",
  "DELIVERED",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  unitPriceCents: number
  quantity: number
  lineTotalCents: number
}

export interface Order {
  id: string
  status: OrderStatus
  restaurant: { id: string; name: string }
  items: OrderItem[]
  totalCents: number
  createdAt: string
  updatedAt: string
}

export interface CreateOrderInput {
  restaurantId: string
  items: { menuItemId: string; quantity: number }[]
}

/** Error body produced by NestJS exception filters. */
export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error?: string
}
