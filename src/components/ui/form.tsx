"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form"
import { Controller, FormProvider, useFormContext } from "react-hook-form"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)
const FormItemContext = React.createContext<{ formItemId: string }>({ formItemId: "" })

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()
  const fieldState = getFieldState(fieldContext.name, formState)
  return {
    ...fieldState,
    name: fieldContext.name,
    formItemId: itemContext.formItemId,
  }
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    const formItemId = React.useId()
    return (
      <FormItemContext.Provider value={{ formItemId }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    )
  }
)
FormItem.displayName = "FormItem"

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  formItemId?: string
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, formItemId, ...props }, ref) => {
    const { error, formItemId: contextFormItemId } = useFormField()
    const id = formItemId || contextFormItemId
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-destructive",
          className
        )}
        {...props}
      />
    )
  }
)
FormLabel.displayName = "FormLabel"

interface FormControlProps extends React.HTMLAttributes<HTMLElement> {}

const FormControl = React.forwardRef<HTMLElement, FormControlProps>(
  ({ ...props }, ref) => {
    const { error, formItemId } = useFormField()
    const formMessageId = `${formItemId}-message`
    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={error ? `${formItemId}-error` : undefined}
        aria-invalid={!!error}
        {...props}
      />
    )
  }
)
FormControl.displayName = "FormControl"

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { error, formItemId } = useFormField()
    const body = error ? String(error.message) : children
    if (!body) return null
    return (
      <p
        ref={ref}
        id={`${formItemId}-error`}
        className={cn("text-sm text-destructive", className)}
        {...props}
      >
        {body}
      </p>
    )
  }
)
FormMessage.displayName = "FormMessage"

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage }