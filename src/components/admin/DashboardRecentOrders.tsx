import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RecentOrder } from "@/types/admin-dashboard"

interface DashboardRecentOrdersProps {
  orders: RecentOrder[]
}

const statusLabels: Record<string, string> = {
  delivered: "Entregado",
  shipped: "Enviado",
  processing: "Procesando",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  pending: "Pendiente",
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  delivered: "default",
  shipped: "secondary",
  processing: "secondary",
  confirmed: "outline",
  cancelled: "destructive",
  pending: "outline",
}

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

export function DashboardRecentOrders({ orders }: DashboardRecentOrdersProps) {
  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="flex flex-col gap-3 px-4 pb-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>Últimos pedidos registrados en la tienda</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            Ver todos
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/[0.16] py-8 text-center text-sm text-muted-foreground">
            No hay pedidos recientes todavía.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className={`flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between ${
                  index !== orders.length - 1 ? "border-b border-border/60" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border/60">
                    <AvatarFallback>
                      {order.customer
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{order.customer}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.orderNumber} · {order.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <Badge variant={statusVariantMap[order.status] || "outline"}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-semibold">S/ {order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(order.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
