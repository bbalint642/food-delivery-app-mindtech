import { redirect } from "next/navigation"
import { DEFAULT_AUTHENTICATED_PATH } from "@/lib/auth/redirect"

// `proxy.ts` already redirects "/" based on the session; this is a fallback.
export default function HomePage() {
  redirect(DEFAULT_AUTHENTICATED_PATH)
}
