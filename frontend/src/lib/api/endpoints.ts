import { apiClient } from "./client"
import type {
  AuthResponse,
  CreateOrderInput,
  LoginInput,
  Order,
  RegisterInput,
  Restaurant,
  RestaurantDetail,
  User,
} from "./types"

export const authApi = {
  register: (input: RegisterInput) =>
    apiClient.post<AuthResponse>("/auth/register", input).then((r) => r.data),
  login: (input: LoginInput) =>
    apiClient.post<AuthResponse>("/auth/login", input).then((r) => r.data),
  whoAmI: () => apiClient.get<User>("/auth/who-am-i").then((r) => r.data),
}

export const restaurantsApi = {
  list: () => apiClient.get<Restaurant[]>("/restaurants").then((r) => r.data),
  get: (id: string) =>
    apiClient
      .get<RestaurantDetail>(`/restaurants/${encodeURIComponent(id)}`)
      .then((r) => r.data),
}

export const ordersApi = {
  create: (input: CreateOrderInput) =>
    apiClient.post<Order>("/orders", input).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<Order>(`/orders/${encodeURIComponent(id)}`).then((r) => r.data),
}

/** Centralized TanStack Query keys. */
export const queryKeys = {
  me: ["auth", "me"] as const,
  restaurants: ["restaurants"] as const,
  restaurant: (id: string) => ["restaurants", id] as const,
  order: (id: string) => ["orders", id] as const,
}
