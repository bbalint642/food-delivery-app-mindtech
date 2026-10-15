"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { setUnauthorizedHandler } from "@/lib/api/client"
import { authApi, queryKeys } from "@/lib/api/endpoints"
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from "@/lib/api/types"
import { LOGIN_PATH, safeRedirectPath } from "./redirect"
import { clearToken, getToken, setToken, subscribeToToken } from "./token"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  login: (input: LoginInput, redirectTo?: string | null) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_EXPIRED_TOAST_ID = "session-expired"

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // `undefined` during SSR/hydration: the cookie is only read in the browser.
  const token = useSyncExternalStore<string | null | undefined>(
    subscribeToToken,
    getToken,
    () => undefined,
  )

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: authApi.whoAmI,
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
    retry: false,
  })

  const endSession = useCallback(() => {
    clearToken()
    queryClient.clear()
    router.replace(LOGIN_PATH)
  }, [queryClient, router])

  // Any 401 on an authenticated request (expired/revoked token) logs out.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      toast.error("Your session has expired. Please log in again.", {
        id: SESSION_EXPIRED_TOAST_ID,
      })
      endSession()
    })
    return () => setUnauthorizedHandler(null)
  }, [endSession])

  const startSession = useCallback(
    (response: AuthResponse, redirectTo?: string | null) => {
      setToken(response.accessToken)
      queryClient.setQueryData(queryKeys.me, response.user)
      router.replace(safeRedirectPath(redirectTo))
    },
    [queryClient, router],
  )

  const login = useCallback(
    async (input: LoginInput, redirectTo?: string | null) => {
      startSession(await authApi.login(input), redirectTo)
    },
    [startSession],
  )

  // The API returns a token on registration, so the customer is logged in right away.
  const register = useCallback(
    async (input: RegisterInput) => {
      startSession(await authApi.register(input))
    },
    [startSession],
  )

  const value = useMemo<AuthContextValue>(() => {
    let status: AuthStatus
    if (token === undefined) status = "loading"
    else if (token === null) status = "unauthenticated"
    else status = meQuery.data ? "authenticated" : "loading"

    return {
      status,
      user: token ? (meQuery.data ?? null) : null,
      login,
      register,
      logout: endSession,
    }
  }, [token, meQuery.data, login, register, endSession])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
