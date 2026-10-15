"use client"

import { useSyncExternalStore } from "react"
import {
  cartReducer,
  emptyCart,
  type CartAction,
  type CartLine,
  type CartState,
} from "./cart"

/** The order in progress: one restaurant at a time, kept for the browser tab. */
export interface ActiveCart {
  restaurantId: string
  restaurantName: string
  cart: CartState
}

const STORAGE_KEY = "mini-food.cart"
const OPEN_CART_EVENT = "mini-food:open-cart"

let current: ActiveCart | null | undefined
const listeners = new Set<() => void>()

function isLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false
  const line = value as Partial<CartLine>
  return (
    typeof line.menuItemId === "string" &&
    typeof line.name === "string" &&
    typeof line.unitPriceCents === "number" &&
    typeof line.quantity === "number" &&
    line.quantity > 0
  )
}

function parse(raw: string): ActiveCart | null {
  try {
    const value = JSON.parse(raw) as Partial<ActiveCart>
    if (
      typeof value.restaurantId !== "string" ||
      typeof value.restaurantName !== "string" ||
      !value.cart ||
      !Array.isArray(value.cart.lines) ||
      !value.cart.lines.every(isLine)
    ) {
      return null
    }
    return {
      restaurantId: value.restaurantId,
      restaurantName: value.restaurantName,
      cart: { lines: value.cart.lines },
    }
  } catch {
    return null
  }
}

function read(): ActiveCart | null {
  if (current !== undefined) return current
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(STORAGE_KEY)
  current = raw ? parse(raw) : null
  return current
}

function write(next: ActiveCart | null) {
  current = next
  if (typeof window !== "undefined") {
    if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else sessionStorage.removeItem(STORAGE_KEY)
  }
  for (const listener of listeners) listener()
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCartSnapshot(): ActiveCart | null {
  return read()
}

export function getServerCartSnapshot(): ActiveCart | null {
  return null
}

export function useActiveCart(): ActiveCart | null {
  return useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  )
}

export function cartHref(cart: ActiveCart): string {
  return `/restaurants/${cart.restaurantId}#cart`
}

/**
 * Applies an action to this restaurant's cart. Adding at a different
 * restaurant replaces the previous order. `clear` drops the cart entirely
 * (used after a successful order).
 */
export function updateRestaurantCart(
  restaurant: { id: string; name: string },
  action: CartAction,
): { replacedRestaurantName: string | null } {
  const existing = read()
  if (action.type === "clear") {
    write(null)
    return { replacedRestaurantName: null }
  }

  const base =
    existing?.restaurantId === restaurant.id ? existing.cart : emptyCart
  const replacedRestaurantName =
    action.type === "add" &&
    existing &&
    existing.restaurantId !== restaurant.id &&
    existing.cart.lines.length > 0
      ? existing.restaurantName
      : null

  write({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    cart: cartReducer(base, action),
  })
  return { replacedRestaurantName }
}

export function clearCart() {
  write(null)
}

export function requestOpenCart() {
  window.dispatchEvent(new Event(OPEN_CART_EVENT))
}

export function subscribeOpenCart(listener: () => void) {
  window.addEventListener(OPEN_CART_EVENT, listener)
  return () => window.removeEventListener(OPEN_CART_EVENT, listener)
}
