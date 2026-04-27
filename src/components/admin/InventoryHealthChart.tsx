"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface InventoryHealthChartProps {
  data: Array<{
    name: string
    value: number
    fill: string
  }>
}

export function InventoryHealthChart({ data }: InventoryHealthChartProps) {
  const hasInventorySignal = data.some((entry) => entry.value > 0)

  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle>Salud del inventario</CardTitle>
        <CardDescription>Distribución del catálogo según disponibilidad de stock</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {!hasInventorySignal ? (
          <div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/[0.16] text-center">
            <div className="space-y-1 px-6">
              <p className="text-sm font-medium text-foreground">Todavía no hay lectura de inventario</p>
              <p className="text-sm text-muted-foreground">
                Cuando existan productos o movimientos de stock, el gráfico se mostrará acá.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[240px] w-full lg:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="2 4" className="stroke-border/70" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  width={40}
                />
                <Tooltip
                  formatter={(value) => `${Number(value)} productos`}
                  contentStyle={{ borderRadius: 14, borderColor: "rgba(148, 163, 184, 0.18)" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={28}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
