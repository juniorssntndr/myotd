"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2, MapPin, Package, ReceiptText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type OrderDetail = {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  notes?: string | null
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    district: string
    zipCode: string
  }
  items: Array<{
    id: string
    productId: string
    variantId?: string
    name: string
    brand: string
    size: string
    color: string
    sku?: string
    price: number
    quantity: number
    total: number
    image: string
  }>
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  pending: { label: "Pendiente", variant: "secondary" as const },
  confirmed: { label: "Confirmado", variant: "outline" as const },
  processing: { label: "Procesando", variant: "secondary" as const },
  shipped: { label: "Enviado", variant: "secondary" as const },
  delivered: { label: "Entregado", variant: "default" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando detalle del pedido...</span>
      </div>
      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardContent className="py-16" />
      </Card>
    </div>
  )
}

export default function ProfileOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const orderId = params?.id
    if (!orderId) return

    const fetchOrder = async () => {
      setLoading(true)
      setNotFound(false)

      try {
        const response = await fetch(`/api/orders/${orderId}`)

        if (response.status === 404) {
          setNotFound(true)
          setOrder(null)
          return
        }

        if (!response.ok) {
          throw new Error("Error fetching order")
        }

        const data = await response.json()
        setOrder(data)
      } catch (error) {
        console.error("Error fetching order detail:", error)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    void fetchOrder()
  }, [params?.id])

  if (loading) {
    return <OrderDetailSkeleton />
  }

  if (notFound || !order) {
    return (
      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">No encontramos ese pedido</h2>
            <p className="text-sm text-muted-foreground">
              Puede que el pedido no exista o no tengas acceso a verlo.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/profile/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a mis pedidos
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 w-fit">
            <Link href="/profile/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a mis pedidos
            </Link>
          </Button>
          <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">
            Realizado el{" "}
            {new Date(order.createdAt).toLocaleDateString("es-PE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Productos del pedido</CardTitle>
            <CardDescription>Detalle de artículos incluidos en la compra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-border/60 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {item.size ? <span>Talla: {item.size}</span> : null}
                    {item.color ? <span>Color: {item.color}</span> : null}
                    {item.sku ? <span>SKU: {item.sku}</span> : null}
                  </div>
                </div>

                <div className="text-right text-sm">
                  <p className="font-medium">S/ {item.total.toFixed(2)}</p>
                  <p className="text-muted-foreground">
                    S/ {item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ReceiptText className="h-4 w-4" />
                Resumen de pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>S/ {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>S/ {order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Método de pago</span>
                <span>{order.paymentMethod}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>S/ {order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Dirección de envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.district}
              </p>
              <p className="text-muted-foreground">CP {order.shippingAddress.zipCode}</p>
            </CardContent>
          </Card>

          {order.notes ? (
            <Card className="border-border/60 bg-card/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Notas del pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
