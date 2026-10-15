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

export function getErrorMessage(error: unknown): string {
  return ApiError.from(error).message
}
