import { isAxiosError } from "axios"
import type { ApiErrorBody } from "./types"

/** Normalized error for every failed API call. */
export class ApiError extends Error {
  constructor(
    /** HTTP status, or 0 when the server could not be reached. */
    readonly status: number,
    /** All messages returned by the API (validation can return several). */
    readonly messages: string[],
  ) {
    super(messages[0] ?? "Something went wrong")
    this.name = "ApiError"
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error
    if (isAxiosError<ApiErrorBody>(error)) {
      if (!error.response) {
        return new ApiError(0, [
          "Cannot reach the server. Please check your connection.",
        ])
      }
      const { status, data } = error.response
      const message = data?.message
      const messages = Array.isArray(message)
        ? message
        : [message ?? error.message]
      return new ApiError(status, messages)
    }
    return new ApiError(0, [
      error instanceof Error ? error.message : "Something went wrong",
    ])
  }
}

const KNOWN_MESSAGES: Record<string, string> = {
  "Something went wrong": "Valami hiba történt",
  "Cannot reach the server. Please check your connection.":
    "A szerver nem érhető el. Ellenőrizd a kapcsolatot.",
  "An order must contain at least one item":
    "A rendelésnek legalább egy tételt kell tartalmaznia.",
  "Each menu item may appear only once; use quantity instead":
    "Minden étel csak egyszer szerepelhet. Használd a mennyiséget.",
  "Order total exceeds the allowed maximum":
    "A rendelés összege meghaladja a megengedett maximumot.",
  "Restaurant not found": "Az étterem nem található.",
  "Order not found": "A rendelés nem található.",
  "Resource not found": "A kért adat nem található.",
}

/** Turns known API messages into Hungarian for the signed-in screens. */
function localizeMessage(message: string): string {
  const exact = KNOWN_MESSAGES[message]
  if (exact) return exact

  const unavailable = /^Menu items currently unavailable: (.+)$/.exec(message)
  if (unavailable) {
    return `Ezek az ételek jelenleg nem elérhetők: ${unavailable[1]}`
  }

  const missing = /^Menu items not found in this restaurant: (.+)$/.exec(message)
  if (missing) {
    return `Ezek az ételek nem szerepelnek ennek az étteremnek az étlapján: ${missing[1]}`
  }

  return message
}

export function getErrorMessage(error: unknown): string {
  return localizeMessage(ApiError.from(error).message)
}
