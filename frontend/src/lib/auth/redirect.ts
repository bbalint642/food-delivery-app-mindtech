export const DEFAULT_AUTHENTICATED_PATH = "/restaurants"
export const LOGIN_PATH = "/login"

/**
 * Only allows same-origin relative paths as post-login redirect targets,
 * preventing open redirects such as `?next=//evil.com`.
 */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return DEFAULT_AUTHENTICATED_PATH
  }
  return next
}
