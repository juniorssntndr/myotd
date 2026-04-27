"use client"

import { useEffect } from "react"
import { type LucideIcon, ShoppingCart, TrendingDown, TrendingUp, Users, WalletCards } from "lucide-react"
import { DashboardOperationalPanel } from "@/components/admin/DashboardOperationalPanel"
import { DashboardRecentOrders } from "@/components/admin/DashboardRecentOrders"
import { DashboardTrendChart } from "@/components/admin/DashboardTrendChart"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminStore } from "@/stores/admin-store"
import type { DashboardKpiMetric, DashboardRange } from "@/types/admin-dashboard"

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("es-PE")

const rangeLabels: Record<DashboardRange, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  "90d": "Últimos 90 días",
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Skeleton className="h-[208px] rounded-2xl" />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,0.95fr)]">
        <Skeleton className="h-[332px] rounded-2xl" />
        <Skeleton className="h-[332px] rounded-2xl" />
      </div>

      <Skeleton className="h-[220px] rounded-2xl" />
    </div>
  )
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function TrendBadge({ change }: { change: number }) {
  const isPositive = change >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <span
      className={
        isPositive
          ? "inline-flex items-center gap-1 rounded-full bg-[var(--myotd-red-soft)] px-2.5 py-1 text-xs font-medium text-[var(--myotd-red)]"
          : "inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {isPositive ? "+" : ""}
      {change}%
    </span>
  )
}

function MetricPanel({
  title,
  subtitle,
  value,
  previousValueLabel,
  metric,
  icon: Icon,
}: {
  title: string
  subtitle: string
  value: string
  previousValueLabel: string
  metric: DashboardKpiMetric
  icon: LucideIcon
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-3 p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-[clamp(1.7rem,2vw,2.2rem)] font-semibold tracking-tight">{value}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <TrendBadge change={metric.change} />
          <span>vs período anterior</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Anterior: <span className="font-medium text-foreground">{previousValueLabel}</span>
        </p>
      </div>
    </div>
  )
}

function TopMetricsBand({
  range,
  onRangeChange,
  revenue,
  orders,
  customers,
  averageOrderValue,
  totalProducts,
  totalCustomers,
  totalOrders,
}: {
  range: DashboardRange
  onRangeChange: (value: DashboardRange) => void
  revenue: DashboardKpiMetric
  orders: DashboardKpiMetric
  customers: DashboardKpiMetric
  averageOrderValue: DashboardKpiMetric
  totalProducts: number
  totalCustomers: number
  totalOrders: number
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <CardContent className="p-0">
        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)] xl:divide-x xl:divide-border/60">
          <div className="flex flex-col gap-4 p-4 lg:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-[var(--myotd-red-border)] bg-[var(--myotd-red-soft)] text-[var(--myotd-red)] hover:bg-[var(--myotd-red-soft)]">
                    Ingresos
                  </Badge>
                  <span className="text-xs text-muted-foreground">{rangeLabels[range]}</span>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Total del período
                    </p>
                    <h2 className="text-[clamp(2.2rem,3.3vw,3.4rem)] font-semibold tracking-tight">
                      {formatCurrency(revenue.value)}
                    </h2>
                  </div>
                  <TrendBadge change={revenue.change} />
                </div>

                <p className="text-sm text-muted-foreground">
                  Período anterior:{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(revenue.previousValue)}
                  </span>
                </p>
              </div>

              <Tabs value={range} onValueChange={(value) => onRangeChange(value as DashboardRange)} className="gap-0">
                <TabsList>
                  <TabsTrigger value="7d">7d</TabsTrigger>
                  <TabsTrigger value="30d">30d</TabsTrigger>
                  <TabsTrigger value="90d">90d</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Catálogo</p>
                <p className="mt-1 font-medium text-foreground">{formatNumber(totalProducts)} productos</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Clientes</p>
                <p className="mt-1 font-medium text-foreground">{formatNumber(totalCustomers)} registrados</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Histórico</p>
                <p className="mt-1 font-medium text-foreground">{formatNumber(totalOrders)} pedidos</p>
              </div>
            </div>
          </div>

          <MetricPanel
            title="Pedidos"
            subtitle={rangeLabels[range]}
            value={formatNumber(orders.value)}
            previousValueLabel={formatNumber(orders.previousValue)}
            metric={orders}
            icon={ShoppingCart}
          />
          <MetricPanel
            title="Clientes nuevos"
            subtitle="Altas asociadas al período"
            value={formatNumber(customers.value)}
            previousValueLabel={formatNumber(customers.previousValue)}
            metric={customers}
            icon={Users}
          />
          <MetricPanel
            title="Ticket promedio"
            subtitle="Valor medio por orden"
            value={formatCurrency(averageOrderValue.value)}
            previousValueLabel={formatCurrency(averageOrderValue.previousValue)}
            metric={averageOrderValue}
            icon={WalletCards}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const {
    dashboardRange,
    stats,
    commercial,
    history,
    operations,
    ordersByStatus,
    recentOrders,
    loading,
    fetchDashboard,
  } = useAdminStore()

  useEffect(() => {
    void fetchDashboard()
  }, [fetchDashboard])

  if (loading && (!stats || !commercial || !operations || !ordersByStatus)) {
    return <DashboardSkeleton />
  }

  if (!stats || !commercial || !operations || !ordersByStatus) {
    return null
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-[clamp(1.9rem,2.5vw,2.5rem)] font-semibold tracking-tight">Dashboard</h1>
        <p className="max-w-3xl text-sm text-muted-foreground lg:text-base">
          Vista comercial compacta con soporte operativo siempre a mano.
        </p>
      </div>

      <TopMetricsBand
        range={dashboardRange}
        onRangeChange={(value) => void fetchDashboard(value)}
        revenue={commercial.revenue}
        orders={commercial.orders}
        customers={commercial.customers}
        averageOrderValue={commercial.averageOrderValue}
        totalProducts={stats.totalProducts}
        totalCustomers={stats.totalCustomers}
        totalOrders={stats.totalOrders}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,0.95fr)]">
        <DashboardTrendChart data={history} range={dashboardRange} />
        <DashboardOperationalPanel
          operations={operations}
          ordersByStatus={ordersByStatus}
          totalProducts={stats.totalProducts}
        />
      </div>

      <DashboardRecentOrders orders={recentOrders} />
    </div>
  )
}
