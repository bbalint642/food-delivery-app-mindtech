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
  address: string
  imageUrl: string | null
}

export interface MenuItem {
  id: string
  name: string
  description: string
  priceCents: number
  isAvailable: boolean
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
