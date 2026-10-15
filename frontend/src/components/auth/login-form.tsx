"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { FormError } from "@/components/form/form-error"
import { FormTextField } from "@/components/form/form-text-field"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/errors"
import { useAuth } from "@/lib/auth/auth-provider"
import { loginSchema, type LoginValues } from "@/lib/validation/auth"

export function LoginForm() {
  const { login } = useAuth()
  const searchParams = useSearchParams()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    try {
      await login(values, searchParams.get("next"))
    } catch (error) {
      const apiError = ApiError.from(error)
      form.setError("root.server", {
        message:
          apiError.status === 401
            ? "Érvénytelen e-mail-cím vagy jelszó."
            : apiError.message,
      })
    }
  }

  const { isSubmitting, errors } = form.formState

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormError message={errors.root?.server?.message} />
        <FormTextField
          control={form.control}
          name="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="te@pelda.hu"
        />
        <FormTextField
          control={form.control}
          name="password"
          label="Jelszó"
          type="password"
          autoComplete="current-password"
        />
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Bejelentkezés
        </Button>
      </FieldGroup>
    </form>
  )
}
