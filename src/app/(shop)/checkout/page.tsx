"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Check, Loader2, AlertCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ShippingForm } from "@/components/checkout/ShippingForm"
import { PaymentForm } from "@/components/checkout/PaymentForm"
import { OrderSummary } from "@/components/checkout/OrderSummary"
import { useCartStore } from "@/stores/cart-store"
import { getShippingCost } from "@/lib/shipping"
import type { PaymentMethod, ShippingAddress } from "@/types"

const steps = [
  { id: 1, name: "Envío" },
  { id: 2, name: "Pago" },
  { id: 3, name: "Confirmar" },
]

const INITIAL_ADDRESS: ShippingAddress = {
  name: "",
  phone: "",
  address: "",
  city: "Lima Centro",
  district: "",
  zipCode: "",
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "CARD":
      return "Tarjeta de crédito/débito"
    case "WALLET":
      return "Yape o Plin"
    case "TRANSFER":
      return "Transferencia bancaria"
    case "CASH_ON_DELIVERY":
      return "Pago contra entrega"
    default:
      return "No definido"
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  const [currentStep, setCurrentStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(INITIAL_ADDRESS)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart")
    }
  }, [items.length, router])

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items]
  )

  const shippingCost = useMemo(() => {
    const district = shippingAddress.district || shippingAddress.city
    return getShippingCost(district, subtotal)
  }, [shippingAddress.city, shippingAddress.district, subtotal])

  const cashOnDeliveryAvailable = shippingAddress.city.startsWith("Lima")

  const total = subtotal + shippingCost

  useEffect(() => {
    if (!cashOnDeliveryAvailable && paymentMethod === "CASH_ON_DELIVERY") {
      setPaymentMethod("CARD")
    }
  }, [cashOnDeliveryAvailable, paymentMethod])

  const isShippingValid =
    shippingAddress.name.trim().length > 1 &&
    shippingAddress.phone.trim().length > 5 &&
    shippingAddress.address.trim().length > 5 &&
    shippingAddress.city.trim().length > 0 &&
    shippingAddress.district.trim().length > 0

  const handleNext = () => {
    setError(null)

    if (currentStep === 1 && !isShippingValid) {
      setError("Completa todos los campos de envío antes de continuar")
      return
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setError(null)
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const payloadItems = items.map((item) => {
        const variant = item.product.variants.find((variantItem) => variantItem.id === item.variantId)

        if (!variant) {
          throw new Error(`Variante no encontrada para ${item.product.name}`)
        }

        return {
          productId: item.product.id,
          variantId: item.variantId,
          name: item.product.name,
          brand: item.product.brand,
          size: variant.size,
          color: variant.color,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0] || "",
        }
      })

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          shippingAddress,
          paymentMethod,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No se pudo iniciar el checkout")
      }

      if (!data.checkoutUrl) {
        throw new Error("La pasarela no devolvió URL de pago")
      }

      clearCart()
      window.location.href = data.checkoutUrl
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Ocurrió un error al procesar el checkout"
      )
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <Button variant="ghost" asChild className="-ml-2 mb-4">
          <Link href="/cart">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver al carrito
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={`ml-2 hidden text-sm font-medium sm:block ${
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-12 sm:w-24 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === 1 && (
              <ShippingForm value={shippingAddress} onChange={setShippingAddress} />
            )}

            {currentStep === 2 && (
              <PaymentForm
                value={paymentMethod}
                onChange={setPaymentMethod}
                shippingCost={shippingCost}
                total={total}
                cashOnDeliveryAvailable={cashOnDeliveryAvailable}
              />
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Confirmar pedido</h2>
                <p className="text-sm text-muted-foreground">
                  Revisa tu información antes de continuar al pago con Culqi.
                </p>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-medium">Dirección de envío</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {shippingAddress.name}
                    <br />
                    {shippingAddress.address}
                    <br />
                    {shippingAddress.district}, {shippingAddress.city}
                    <br />
                    {shippingAddress.phone}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-medium">Método de pago</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getPaymentMethodLabel(paymentMethod)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notas del pedido (opcional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Ej: entregar en portería, referencia adicional"
                  />
                </div>
              </div>
            )}

            <Separator className="my-6" />

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || loading}>
                Atrás
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={loading}>
                  Continuar
                </Button>
              ) : (
                <Button onClick={handleCheckout} disabled={loading || !isShippingValid}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirigiendo...
                    </>
                  ) : (
                    "Confirmar y pagar"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <OrderSummary items={items} subtotal={subtotal} shippingCost={shippingCost} />
          </div>
        </div>
      </div>
    </div>
  )
}
