"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormError } from "@/components/form/form-error"
import { FormTextField } from "@/components/form/form-text-field"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/errors"
import { useAuth } from "@/lib/auth/auth-provider"
import { registerSchema, type RegisterValues } from "@/lib/validation/auth"

export function RegisterForm() {
  const { register } = useAuth()
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(values: RegisterValues) {
    try {
      // Registration returns a token, so the customer is logged in right away.
      await register(values)
    } catch (error) {
      const apiError = ApiError.from(error)
      if (apiError.status === 409) {
        form.setError("email", { message: "This email is already registered." })
      } else {
        form.setError("root.server", { message: apiError.messages.join(" ") })
      }
    }
  }

  const { isSubmitting, errors } = form.formState

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormError message={errors.root?.server?.message} />
        <FormTextField
          control={form.control}
          name="name"
          label="Name"
          autoComplete="name"
          placeholder="Jane Doe"
        />
        <FormTextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormTextField
          control={form.control}
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters, a letter and a digit"
        />
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Create account
        </Button>
      </FieldGroup>
    </form>
  )
}
