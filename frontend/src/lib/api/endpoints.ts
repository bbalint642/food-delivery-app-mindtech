import { apiClient } from "./client"
import type {
  AuthResponse,
  CreateOrderInput,
  CuisineFacet,
  Deal,
  LoginInput,
  Order,
  RegisterInput,
  RestaurantDetail,
  RestaurantFilters,
  RestaurantListItem,
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
  list: (filters: RestaurantFilters = {}) =>
    apiClient
      .get<RestaurantListItem[]>("/restaurants", {
        params: filters,
        // Arrays as repeated keys (`cuisine=a&cuisine=b`), as the API expects.
        paramsSerializer: { indexes: null },
      })
      .then((r) => r.data),
  cuisines: () =>
    apiClient.get<CuisineFacet[]>("/restaurants/cuisines").then((r) => r.data),
  deals: (limit?: number) =>
    apiClient
      .get<Deal[]>("/restaurants/deals", { params: { limit } })
      .then((r) => r.data),
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
  restaurants: (filters: RestaurantFilters = {}) =>
    ["restaurants", "list", filters] as const,
  cuisines: ["restaurants", "cuisines"] as const,
  deals: ["restaurants", "deals"] as const,
  restaurant: (id: string) => ["restaurants", id] as const,
  order: (id: string) => ["orders", id] as const,
}
