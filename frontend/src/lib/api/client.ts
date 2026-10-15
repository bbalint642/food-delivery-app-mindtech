import axios from "axios"
import { getToken } from "@/lib/auth/token"
import { API_URL } from "@/lib/config"
import { ApiError } from "./errors"

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
})

type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

/** Lets the auth layer react (log out) when an authenticated call gets 401. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = ApiError.from(error)
    const sentToken =
      axios.isAxiosError(error) &&
      Boolean(error.config?.headers?.Authorization)
    // A 401 on an authenticated request means the session is no longer valid.
    // (Login itself also returns 401, but is sent without a token.)
    if (apiError.status === 401 && sentToken) {
      onUnauthorized?.()
    }
    return Promise.reject(apiError)
  },
)
