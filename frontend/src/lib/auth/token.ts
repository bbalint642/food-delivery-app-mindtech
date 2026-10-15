import { decodeJwt, isTokenExpired } from "./jwt"

/**
 * The JWT is kept in a cookie (not localStorage) so that `proxy.ts` can
 * read it and redirect before a protected page renders. The cookie is
 * SameSite=Lax and scoped to this origin; the API still receives the token
 * only via the `Authorization` header.
 */
export const TOKEN_COOKIE = "mf_token"

const TOKEN_CHANGE_EVENT = "mf-token-change"

function readCookie(name: string): string | null {
  const prefix = `${name}=`
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix))
  return match ? decodeURIComponent(match.slice(prefix.length)) : null
}

/** Returns the stored token if present and not expired (browser only). */
export function getToken(): string | null {
  if (typeof document === "undefined") return null
  const token = readCookie(TOKEN_COOKIE)
  return token && !isTokenExpired(token) ? token : null
}

export function setToken(token: string): void {
  const claims = decodeJwt(token)
  const maxAge = claims
    ? Math.max(0, claims.exp - Math.floor(Date.now() / 1000))
    : 0
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT))
}

export function clearToken(): void {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT))
}

/** Subscription for `useSyncExternalStore`. */
export function subscribeToToken(callback: () => void): () => void {
  window.addEventListener(TOKEN_CHANGE_EVENT, callback)
  return () => window.removeEventListener(TOKEN_CHANGE_EVENT, callback)
}
