"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DashboardHistoryPoint, DashboardRange } from "@/types/admin-dashboard"

interface DashboardTrendChartProps {
  data: DashboardHistoryPoint[]
  range: DashboardRange
}

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
})

const compactNumberFormatter = new Intl.NumberFormat("es-PE", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function DashboardTrendChart({ data, range }: DashboardTrendChartProps) {
  const hasActivity = data.some((point) => point.revenue > 0 || point.orders > 0)

  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <Tabs defaultValue="revenue" className="gap-0">
        <CardHeader className="flex flex-col gap-3 px-4 pb-2 pt-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Tendencia comercial</CardTitle>
            <CardDescription>
              Evolución de ingresos y pedidos durante los últimos {range.replace("d", " días")}
            </CardDescription>
          </div>

          <TabsList>
            <TabsTrigger value="revenue">Ingresos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          {!hasActivity ? (
            <div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/[0.16] text-center">
              <div className="space-y-1 px-6">
                <p className="text-sm font-medium text-foreground">Todavía no hay movimiento suficiente</p>
                <p className="text-sm text-muted-foreground">
                  Cuando entren pedidos o ingresos, la tendencia aparecerá acá con claridad.
                </p>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="revenue" className="mt-0">
                <div className="h-[240px] w-full lg:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashboardRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--myotd-red)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--myotd-red)" stopOpacity={0.015} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="2 4" className="stroke-border/70" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "currentColor", fontSize: 12 }}
                        minTickGap={24}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) => compactNumberFormatter.format(value)}
                        tick={{ fill: "currentColor", fontSize: 12 }}
                        width={62}
                      />
                      <Tooltip
                        formatter={(value) => currencyFormatter.format(Number(value))}
                        labelFormatter={(label) => `Fecha: ${label}`}
                        contentStyle={{ borderRadius: 14, borderColor: "rgba(148, 163, 184, 0.18)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--myotd-red)"
                        strokeWidth={2.25}
                        fill="url(#dashboardRevenueGradient)"
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                <div className="h-[240px] w-full lg:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="2 4" className="stroke-border/70" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "currentColor", fontSize: 12 }}
                        minTickGap={24}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "currentColor", fontSize: 12 }}
                        width={36}
                      />
                      <Tooltip
                        formatter={(value) => `${Number(value)} pedidos`}
                        labelFormatter={(label) => `Fecha: ${label}`}
                        contentStyle={{ borderRadius: 14, borderColor: "rgba(148, 163, 184, 0.18)" }}
                      />
                      <Bar dataKey="orders" fill="var(--myotd-red-muted)" radius={[8, 8, 0, 0]} maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </>
          )}
        </CardContent>
      </Tabs>
    </Card>
  )
}
