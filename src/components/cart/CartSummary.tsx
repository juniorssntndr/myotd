"use client"

import { Truck } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/types"
import { CheckoutButton } from "./CheckoutButton"

interface CartSummaryProps {
  items: CartItem[]
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  )
  const qualifiesForFreeShipping = subtotal >= 200
  const total = subtotal

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Resumen del Pedido</h2>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span>{qualifiesForFreeShipping ? "Gratis" : "Se calcula en checkout"}</span>
        </div>

        {!qualifiesForFreeShipping && (
          <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-xs">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span>
              Agrega S/ {(200 - subtotal).toFixed(2)} más para envío gratis
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>{qualifiesForFreeShipping ? "Total" : "Subtotal actual"}</span>
          <span className="text-lg text-primary">S/ {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6">
        <CheckoutButton items={items} />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Pago seguro con Culqi (Tarjeta, Yape y Plin). Impuestos incluidos.
      </p>
    </div>
  )
}
