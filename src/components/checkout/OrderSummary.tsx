"use client"

import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/types"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping"

interface OrderSummaryProps {
  items: CartItem[]
  subtotal?: number
  shippingCost?: number
}

export function OrderSummary({ items, subtotal, shippingCost }: OrderSummaryProps) {
  const calculatedSubtotal = subtotal ?? items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  )

  const calculatedShipping = shippingCost ?? (calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15)
  const qualifiesForFreeShipping = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD || calculatedShipping === 0
  const total = calculatedSubtotal + calculatedShipping

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Resumen del Pedido</h2>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={`${item.product.id}-${item.variantId}`} className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col">
              <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">{item.product.brand}</p>
              {(() => {
                const variant = item.product.variants.find((v) => v.id === item.variantId)
                if (!variant) return null

                return (
                  <p className="text-xs text-muted-foreground">
                    Talla: {variant.size} | Color: {variant.color}
                  </p>
                )
              })()}
            </div>
            <p className="text-sm font-medium">
              S/ {(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>S/ {calculatedSubtotal.toFixed(2)}</span>
        </div>

        {!qualifiesForFreeShipping && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Envío</span>
            <span>
              S/ {calculatedShipping.toFixed(2)}
            </span>
          </div>
        )}

        {qualifiesForFreeShipping && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Envío gratis</span>
            <span>Gratis</span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span className="text-lg text-primary">S/ {total.toFixed(2)}</span>
      </div>

      {!qualifiesForFreeShipping && (
        <p className="mt-3 text-xs text-muted-foreground">
          Agrega S/ {(FREE_SHIPPING_THRESHOLD - calculatedSubtotal).toFixed(2)} más para obtener envío gratis
        </p>
      )}
    </div>
  )
}
