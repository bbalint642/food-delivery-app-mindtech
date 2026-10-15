/** Base URL of the NestJS API. Inlined at build time (NEXT_PUBLIC_ prefix). */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/+$/, "")
