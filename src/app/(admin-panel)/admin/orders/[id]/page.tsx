"use client"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, CreditCard, Mail, Phone, ShoppingBag, Truck, User, MapPin, FileText, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAdminStore } from "@/stores/admin-store"

interface PageProps {
  params: Promise<{ id: string }>
}

interface OrderDetail {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
  }
  status: string
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  culqiPaymentId?: string
  notes?: string
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    district: string
    zipCode: string
  }
  items: {
    id: string
    productId: string
    variantId?: string
    name: string
    brand: string
    size: string
    color: string
    sku: string
    price: number
    quantity: number
    total: number
    image: string
  }[]
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  pending: { label: "Pendiente", variant: "secondary" as const, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  confirmed: { label: "Confirmado", variant: "outline" as const, className: "border-blue-500/30 text-blue-500 bg-blue-500/5" },
  processing: { label: "En Proceso", variant: "outline" as const, className: "border-indigo-500/30 text-indigo-500 bg-indigo-500/5" },
  shipped: { label: "Enviado", variant: "secondary" as const, className: "bg-blue-600 text-white" },
  delivered: { label: "Entregado", variant: "default" as const, className: "bg-emerald-600 hover:bg-emerald-600 text-white" },
  cancelled: { label: "Cancelado", variant: "destructive" as const, className: "" },
}

const methodLabels: Record<string, string> = {
  CARD: "Tarjeta de Crédito/Débito",
  TRANSFER: "Transferencia Bancaria",
  WALLET: "Yape/Plin",
  CASH_ON_DELIVERY: "Pago Contra Entrega",
}

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { updateOrderStatus, deleteOrder } = useAdminStore()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) {
        throw new Error("No se pudo cargar el pedido")
      }
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar los detalles del pedido")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchOrder()
  }, [fetchOrder])

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    try {
      setUpdating(true)
      await updateOrderStatus(order.id, newStatus)
      setOrder((prev) => prev ? { ...prev, status: newStatus.toLowerCase() } : null)
      toast.success("Estado del pedido actualizado correctamente")
    } catch (error) {
      console.error(error)
      toast.error("Error al actualizar el estado del pedido")
    } finally {
      setUpdating(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!order) return
    try {
      setUpdating(true)
      await deleteOrder(order.id)
      toast.success("Pedido eliminado correctamente")
      router.push("/admin/orders")
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar el pedido")
      setUpdating(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[120px] rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] rounded-xl" />
            <Skeleton className="h-[250px] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">No se encontró el pedido</h2>
        <Button asChild className="mt-4">
          <Link href="/admin/orders">Volver a Pedidos</Link>
        </Button>
      </div>
    )
  }

  const status = statusConfig[order.status as keyof typeof statusConfig] || {
    label: order.status,
    variant: "outline" as const,
    className: "",
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Pedido {order.orderNumber}</h1>
              <Badge variant={status.variant} className={status.className}>
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registrado el {new Date(order.createdAt).toLocaleString("es-PE")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:self-end">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            Estado del pedido:
          </span>
          <Select
            value={order.status.toUpperCase()}
            onValueChange={handleStatusChange}
            disabled={updating}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
              <SelectItem value="PROCESSING">En Proceso</SelectItem>
              <SelectItem value="SHIPPED">Enviado</SelectItem>
              <SelectItem value="DELIVERED">Entregado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={updating}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar Pedido
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Items card */}
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                Artículos del Pedido
              </CardTitle>
              <CardDescription>Productos adquiridos en esta transacción</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 p-0">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 items-center">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-muted flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[`Marca: ${item.brand}`, item.size ? `Talla: ${item.size}` : null, `Color: ${item.color}`].filter(Boolean).join(" | ")}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      SKU: {item.sku || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {currencyFormatter.format(item.price)} x {item.quantity}
                    </p>
                    <p className="text-xs font-bold text-primary mt-0.5">
                      {currencyFormatter.format(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Notas del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.notes ? (
                <p className="text-sm text-foreground bg-muted/40 rounded-xl p-3.5 border border-border/50 whitespace-pre-wrap">
                  {order.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">El cliente no especificó ninguna nota especial para este pedido.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer details card */}
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Detalle del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {order.customer.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">ID Cliente: {order.id.slice(0, 8)}...</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.shippingAddress.phone || "Sin teléfono"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping address card */}
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">{order.shippingAddress.name}</p>
                <p className="text-muted-foreground mt-1">{order.shippingAddress.address}</p>
                <p className="text-muted-foreground mt-0.5">
                  {order.shippingAddress.district}, {order.shippingAddress.city}
                </p>
                {order.shippingAddress.zipCode && (
                  <p className="text-muted-foreground mt-0.5">C.P. {order.shippingAddress.zipCode}</p>
                )}
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>Despacho regular vía courier local.</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment & pricing summary */}
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                Resumen de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método:</span>
                  <span className="font-medium text-foreground">{methodLabels[order.paymentMethod] || order.paymentMethod}</span>
                </div>
                {order.culqiPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Culqi ID:</span>
                    <span className="font-mono text-xs text-muted-foreground">{order.culqiPaymentId}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{currencyFormatter.format(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío:</span>
                  <span>{currencyFormatter.format(order.shipping)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-base font-bold">
                  <span className="text-foreground">Total:</span>
                  <span className="text-primary">{currencyFormatter.format(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar el pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el pedido{" "}
              <span className="font-semibold text-foreground">{order?.orderNumber}</span>, sus
              artículos asociados y se restaurará el stock de los productos si el pedido está activo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={updating}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
