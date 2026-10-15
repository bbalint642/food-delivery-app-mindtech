export interface JwtClaims {
  sub: string
  email: string
  iat: number
  exp: number
}

/**
 * Decodes (does NOT verify) the payload of a JWT. Only used for
 * client-side UX decisions such as expiry; the API verifies the signature.
 */
export function decodeJwt(token: string): JwtClaims | null {
  const payload = token.split(".")[1]
  if (!payload) return null
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
    const claims: unknown = JSON.parse(atob(padded))
    if (
      typeof claims === "object" &&
      claims !== null &&
      typeof (claims as JwtClaims).exp === "number"
    ) {
      return claims as JwtClaims
    }
    return null
  } catch {
    return null
  }
}

/** True if the token is malformed or expires within `leewaySeconds`. */
export function isTokenExpired(token: string, leewaySeconds = 10): boolean {
  const claims = decodeJwt(token)
  if (!claims) return true
  return claims.exp * 1000 <= Date.now() + leewaySeconds * 1000
}
