import type { CreateOrderInput, MenuItem } from "@/lib/api/types"

/**
 * Pure cart state for a single restaurant. Prices are only used for
 * display; the API recalculates them when the order is placed.
 */

export const MAX_QUANTITY = 99

export interface CartLine {
  menuItemId: string
  name: string
  unitPriceCents: number
  quantity: number
}

export interface CartState {
  lines: CartLine[]
}

export type CartAction =
  | { type: "add"; item: Pick<MenuItem, "id" | "name" | "priceCents"> }
  | { type: "increment"; menuItemId: string }
  | { type: "decrement"; menuItemId: string }
  | { type: "remove"; menuItemId: string }
  | { type: "clear" }

export const emptyCart: CartState = { lines: [] }

function changeQuantity(
  state: CartState,
  menuItemId: string,
  delta: number,
): CartState {
  return {
    lines: state.lines
      .map((line) =>
        line.menuItemId === menuItemId
          ? {
              ...line,
              quantity: Math.min(MAX_QUANTITY, line.quantity + delta),
            }
          : line,
      )
      .filter((line) => line.quantity > 0),
  }
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const exists = state.lines.some(
        (line) => line.menuItemId === action.item.id,
      )
      if (exists) return changeQuantity(state, action.item.id, 1)
      return {
        lines: [
          ...state.lines,
          {
            menuItemId: action.item.id,
            name: action.item.name,
            unitPriceCents: action.item.priceCents,
            quantity: 1,
          },
        ],
      }
    }
    case "increment":
      return changeQuantity(state, action.menuItemId, 1)
    case "decrement":
      return changeQuantity(state, action.menuItemId, -1)
    case "remove":
      return {
        lines: state.lines.filter(
          (line) => line.menuItemId !== action.menuItemId,
        ),
      }
    case "clear":
      return emptyCart
  }
}

export function cartTotalCents(state: CartState): number {
  return state.lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  )
}

export function cartItemCount(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function quantityOf(state: CartState, menuItemId: string): number {
  return (
    state.lines.find((line) => line.menuItemId === menuItemId)?.quantity ?? 0
  )
}

/** Only ids and quantities are sent – never prices. */
export function toCreateOrderInput(
  restaurantId: string,
  state: CartState,
): CreateOrderInput {
  return {
    restaurantId,
    items: state.lines.map(({ menuItemId, quantity }) => ({
      menuItemId,
      quantity,
    })),
  }
}
