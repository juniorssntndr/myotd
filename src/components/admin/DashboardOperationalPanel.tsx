import type { LucideIcon } from "lucide-react"
import { AlertTriangle, Boxes, CircleAlert, PackageCheck, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardOperationalMetrics, OrdersByStatus } from "@/types/admin-dashboard"

interface DashboardOperationalPanelProps {
  operations: DashboardOperationalMetrics
  ordersByStatus: OrdersByStatus
  totalProducts: number
}

const statusConfig = [
  { key: "pending", label: "Pendientes", tone: "bg-amber-500" },
  { key: "confirmed", label: "Confirmados", tone: "bg-sky-500" },
  { key: "processing", label: "Procesando", tone: "bg-violet-500" },
  { key: "shipped", label: "Enviados", tone: "bg-blue-600" },
  { key: "delivered", label: "Entregados", tone: "bg-emerald-500" },
  { key: "cancelled", label: "Cancelados", tone: "bg-rose-500" },
] as const

function OperationalMetricRow({
  label,
  value,
  helper,
  icon: Icon,
  iconClassName,
}: {
  label: string
  value: string
  helper: string
  icon: LucideIcon
  iconClassName: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/[0.24]">
          <Icon className={`h-4 w-4 ${iconClassName}`} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

export function DashboardOperationalPanel({
  operations,
  ordersByStatus,
  totalProducts,
}: DashboardOperationalPanelProps) {
  const maxStatusValue = Math.max(...Object.values(ordersByStatus), 1)

  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle>Salud operativa</CardTitle>
        <CardDescription>
          Lo justo para detectar cuellos de botella, stock sensible y cumplimiento.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="divide-y divide-border/60">
            <OperationalMetricRow
              label="Cumplimiento"
              value={`${operations.fulfillmentRate}%`}
              helper="Pedidos entregados sobre órdenes no canceladas del período."
              icon={PackageCheck}
              iconClassName="text-emerald-500"
            />
            <OperationalMetricRow
              label="Órdenes abiertas"
              value={operations.openOrders.toString()}
              helper="Pendientes, confirmadas, procesando y enviadas."
              icon={Truck}
              iconClassName="text-sky-500"
            />
            <OperationalMetricRow
              label="Catálogo activo"
              value={operations.activeProducts.toString()}
              helper={
                totalProducts > 0
                  ? `${Math.round((operations.activeProducts / totalProducts) * 100)}% del catálogo total.`
                  : "Sin catálogo activo aún."
              }
              icon={Boxes}
              iconClassName="text-violet-500"
            />
            <OperationalMetricRow
              label="Riesgo de stock"
              value={(operations.lowStockProducts + operations.outOfStockProducts).toString()}
              helper={`${operations.lowStockProducts} bajos · ${operations.outOfStockProducts} agotados.`}
              icon={CircleAlert}
              iconClassName="text-[var(--myotd-red)]"
            />
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-border/60 px-3 py-3.5">
          <div>
            <h3 className="text-sm font-semibold">Estados de pedidos</h3>
            <p className="text-xs text-muted-foreground">Distribución actual de la cola operativa.</p>
          </div>

          <div className="space-y-2.5">
            {statusConfig.map((status) => {
              const value = ordersByStatus[status.key]
              const width = `${Math.max((value / maxStatusValue) * 100, value > 0 ? 14 : 6)}%`

              return (
                <div key={status.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{status.label}</span>
                    <span className="text-xs font-medium text-muted-foreground">{value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className={`h-1.5 rounded-full ${status.tone}`} style={{ width }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-border/60 px-3 py-3.5">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-[var(--myotd-red)]" />
              Productos críticos
            </h3>
            <p className="text-xs text-muted-foreground">Agotamiento o stock por debajo del umbral.</p>
          </div>

          {operations.criticalProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/[0.16] px-3 py-4 text-sm text-muted-foreground">
              No hay productos en riesgo por ahora.
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-muted/[0.12]">
              {operations.criticalProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.status === "out" ? "destructive" : "secondary"}>
                      {product.status === "out" ? "Agotado" : "Stock bajo"}
                    </Badge>
                    <span className="text-sm font-semibold">{product.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  )
}
