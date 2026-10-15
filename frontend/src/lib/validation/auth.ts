import { z } from "zod"

/** Mirrors the backend RegisterDto / LoginDto rules for instant feedback. */

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .pipe(z.email("Enter a valid email address"))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(72),
})

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/\p{L}/u, "Password must contain a letter")
    .regex(/\d/, "Password must contain a digit"),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
