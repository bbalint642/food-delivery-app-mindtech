import { NextResponse, type NextRequest } from "next/server"
import { isTokenExpired } from "@/lib/auth/jwt"
import { DEFAULT_AUTHENTICATED_PATH, LOGIN_PATH } from "@/lib/auth/redirect"
import { TOKEN_COOKIE } from "@/lib/auth/token"

const AUTH_PAGES = ["/login", "/register"]
const PROTECTED_PREFIXES = ["/restaurants", "/orders"]

/**
 * Optimistic route protection: only checks that a non-expired token
 * cookie exists. The API remains the authority and rejects invalid tokens.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = request.cookies.get(TOKEN_COOKIE)?.value
  const isAuthenticated = Boolean(token && !isTokenExpired(token))

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set("next", `${pathname}${search}`)
    const response = NextResponse.redirect(loginUrl)
    if (token) response.cookies.delete(TOKEN_COOKIE)
    return response
  }

  if (AUTH_PAGES.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(
      new URL(DEFAULT_AUTHENTICATED_PATH, request.url),
    )
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(
        isAuthenticated ? DEFAULT_AUTHENTICATED_PATH : LOGIN_PATH,
        request.url,
      ),
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/restaurants/:path*",
    "/orders/:path*",
  ],
}
