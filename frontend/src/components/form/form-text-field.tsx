"use client"

import { useId, type ComponentProps } from "react"
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface FormTextFieldProps<TValues extends FieldValues>
  extends Omit<ComponentProps<typeof Input>, "name" | "id" | "defaultValue"> {
  control: Control<TValues>
  name: FieldPath<TValues>
  label: string
}

/** shadcn `Field` + `Input` bound to a react-hook-form field. */
export function FormTextField<TValues extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: FormTextFieldProps<TValues>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            {...inputProps}
            {...field}
            id={id}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
