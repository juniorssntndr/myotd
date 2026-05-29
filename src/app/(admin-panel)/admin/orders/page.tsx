"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { type LucideIcon, Clock3, Eye, MoreHorizontal, Search, Truck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminStore } from "@/stores/admin-store"

const statusConfig = {
  pending: { label: "Pendiente", variant: "secondary" as const, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  confirmed: { label: "Confirmado", variant: "outline" as const, className: "border-blue-500/30 text-blue-500 bg-blue-500/5" },
  processing: { label: "En Proceso", variant: "outline" as const, className: "border-indigo-500/30 text-indigo-500 bg-indigo-500/5" },
  shipped: { label: "Enviado", variant: "secondary" as const, className: "bg-blue-600 text-white" },
  delivered: { label: "Entregado", variant: "default" as const, className: "bg-emerald-600 hover:bg-emerald-600 text-white" },
  cancelled: { label: "Cancelado", variant: "destructive" as const, className: "" },
}

const methodLabels: Record<string, string> = {
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  WALLET: "Yape/Plin",
  CASH_ON_DELIVERY: "Contra Entrega",
}

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function MetricPane({
  title,
  subtitle,
  value,
  helper,
  icon: Icon,
  accent = "muted",
}: {
  title: string
  subtitle: string
  value: string
  helper: string
  icon: LucideIcon
  accent?: "brand" | "muted" | "warning" | "danger" | "success"
}) {
  const accentClassName =
    accent === "brand"
      ? "bg-[var(--myotd-red-soft)] text-[var(--myotd-red)]"
      : accent === "warning"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : accent === "danger"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      : accent === "success"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : "bg-muted/60 text-muted-foreground"

  return (
    <div className="flex h-full flex-col justify-between gap-3 p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${accentClassName}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-[clamp(1.7rem,2vw,2.2rem)] font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </div>
    </div>
  )
}

function OrdersSummaryBand({
  totalOrders,
  pendingCount,
  shippedCount,
  totalRevenue,
}: {
  totalOrders: number
  pendingCount: number
  shippedCount: number
  totalRevenue: number
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <CardContent className="p-0">
        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)] xl:divide-x xl:divide-border/60">
          <div className="flex flex-col gap-4 p-4 lg:p-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-[var(--myotd-red-border)] bg-[var(--myotd-red-soft)] text-[var(--myotd-red)] hover:bg-[var(--myotd-red-soft)]">
                  Logística
                </Badge>
                <span className="text-xs text-muted-foreground">Monitoreo general de pedidos y entregas</span>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Ingresos Totales (Completados)
                </p>
                <h2 className="text-[clamp(2.2rem,3.3vw,3.4rem)] font-semibold tracking-tight">
                  {currencyFormatter.format(totalRevenue)}
                </h2>
              </div>

              <p className="text-sm text-muted-foreground">
                {totalOrders} pedidos totales registrados en el sistema.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">En espera</p>
                <p className="mt-1 font-medium text-foreground">{pendingCount} pedidos</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">En camino</p>
                <p className="mt-1 font-medium text-foreground">{shippedCount} despachos</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Total Histórico</p>
                <p className="mt-1 font-medium text-foreground">{totalOrders} ordenes</p>
              </div>
            </div>
          </div>

          <MetricPane
            title="Pendientes"
            subtitle="Pedidos por confirmar"
            value={String(pendingCount)}
            helper="Requieren validación de pago o stock."
            icon={Clock3}
            accent="warning"
          />
          <MetricPane
            title="Despachados"
            subtitle="Pedidos en camino"
            value={String(shippedCount)}
            helper="Pedidos actualmente en tránsito."
            icon={Truck}
            accent="brand"
          />
          <MetricPane
            title="Entregados"
            subtitle="Logística completada"
            value={String(totalOrders - pendingCount - shippedCount)}
            helper="Entregas confirmadas con éxito."
            icon={CheckCircle2}
            accent="success"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[208px] rounded-2xl" />
      <Skeleton className="h-[76px] rounded-2xl" />
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  )
}

export default function AdminOrdersPage() {
  const { orders, loading, fetchOrders } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  // Filter and search orders on client-side for fast instant responsiveness
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate metrics
  const totalRevenue = orders
    .filter((o) => o.status === "delivered" || o.status === "processing" || o.status === "shipped")
    .reduce((sum, o) => sum + o.total, 0)

  const pendingCount = orders.filter((o) => o.status === "pending").length
  const shippedCount = orders.filter((o) => o.status === "shipped").length

  if (loading && orders.length === 0) {
    return <OrdersSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Administra y haz seguimiento logístico a las compras de tus clientes.</p>
        </div>
      </div>

      <OrdersSummaryBand
        totalOrders={orders.length}
        pendingCount={pendingCount}
        shippedCount={shippedCount}
        totalRevenue={totalRevenue}
      />

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
                <TabsTrigger value="processing">En Proceso</TabsTrigger>
                <TabsTrigger value="shipped">Enviados</TabsTrigger>
                <TabsTrigger value="delivered">Entregados</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
              </TabsList>

              <div className="relative max-w-sm flex-1 sm:min-w-72">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por N° pedido, cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value={statusFilter} className="mt-0">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No se encontraron pedidos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const status = statusConfig[order.status as keyof typeof statusConfig] || {
                        label: order.status,
                        variant: "outline" as const,
                        className: "",
                      }

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm font-semibold">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-primary hover:underline"
                            >
                              {order.orderNumber}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{order.customer.name}</p>
                              <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.itemCount} {order.itemCount === 1 ? "producto" : "productos"}
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {currencyFormatter.format(order.total)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {methodLabels[order.paymentMethod] || order.paymentMethod}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className={status.className}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {dateFormatter.format(new Date(order.createdAt))}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/orders/${order.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver detalles
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
