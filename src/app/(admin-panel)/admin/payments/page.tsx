"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Clock3, Download, Eye, MoreHorizontal, Receipt, RefreshCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { payments } from "@/data/mock-admin"

const statusConfig = {
  completed: { label: "Completado", variant: "default" as const, className: "bg-green-600" },
  pending: { label: "Pendiente", variant: "secondary" as const, className: "" },
  failed: { label: "Fallido", variant: "destructive" as const, className: "" },
  refunded: { label: "Reembolsado", variant: "outline" as const, className: "" },
}

const methodLabels = {
  card: "Tarjeta",
  transfer: "Transferencia",
  wallet: "Billetera",
}

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
})

function PaymentMetricPane({
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

function PaymentsSummaryBand({
  totalRevenue,
  pendingAmount,
  refundedAmount,
  totalTransactions,
}: {
  totalRevenue: number
  pendingAmount: number
  refundedAmount: number
  totalTransactions: number
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <CardContent className="p-0">
        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)] xl:divide-x xl:divide-border/60">
          <div className="flex flex-col gap-4 p-4 lg:p-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-[var(--myotd-red-border)] bg-[var(--myotd-red-soft)] text-[var(--myotd-red)] hover:bg-[var(--myotd-red-soft)]">
                  Finanzas
                </Badge>
                <span className="text-xs text-muted-foreground">Vista general de pagos y transacciones</span>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Total recibido
                </p>
                <h2 className="text-[clamp(2.2rem,3.3vw,3.4rem)] font-semibold tracking-tight">
                  {currencyFormatter.format(totalRevenue)}
                </h2>
              </div>

              <p className="text-sm text-muted-foreground">
                {totalTransactions} transacciones registradas con seguimiento por estado y método.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Pendiente</p>
                <p className="mt-1 font-medium text-foreground">{currencyFormatter.format(pendingAmount)}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Reembolsado</p>
                <p className="mt-1 font-medium text-foreground">{currencyFormatter.format(refundedAmount)}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Transacciones</p>
                <p className="mt-1 font-medium text-foreground">{totalTransactions}</p>
              </div>
            </div>
          </div>

          <PaymentMetricPane
            title="Pendiente"
            subtitle="Monto en espera de confirmación"
            value={currencyFormatter.format(pendingAmount)}
            helper="Pagos aún no conciliados."
            icon={Clock3}
            accent="warning"
          />
          <PaymentMetricPane
            title="Reembolsado"
            subtitle="Monto devuelto a clientes"
            value={currencyFormatter.format(refundedAmount)}
            helper="Importe devuelto o revertido."
            icon={RefreshCcw}
            accent="danger"
          />
          <PaymentMetricPane
            title="Transacciones"
            subtitle="Volumen total registrado"
            value={String(totalTransactions)}
            helper="Pagos completados, pendientes y fallidos."
            icon={Receipt}
            accent="muted"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentsTable({
  rows,
  showStatus = true,
  allowRefund = false,
}: {
  rows: typeof payments
  showStatus?: boolean
  allowRefund?: boolean
}) {
  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pago</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Monto</TableHead>
              {showStatus ? <TableHead>Estado</TableHead> : null}
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((payment) => {
              const status = statusConfig[payment.status]

              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                  <TableCell>{payment.userName}</TableCell>
                  <TableCell className="font-mono text-sm">{payment.orderId}</TableCell>
                  <TableCell>{methodLabels[payment.method]}</TableCell>
                  <TableCell className="font-medium">S/ {payment.amount.toFixed(2)}</TableCell>
                  {showStatus ? (
                    <TableCell>
                      <Badge variant={status.variant} className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                  ) : null}
                  <TableCell className="text-muted-foreground">{payment.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        {allowRefund ? (
                          <DropdownMenuItem>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reembolsar
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0)

  const refundedAmount = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground">Administra los pagos y transacciones.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <PaymentsSummaryBand
        totalRevenue={totalRevenue}
        pendingAmount={pendingAmount}
        refundedAmount={refundedAmount}
        totalTransactions={payments.length}
      />

      <Tabs defaultValue="all" className="space-y-4">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="completed">Completados</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="failed">Fallidos</TabsTrigger>
              </TabsList>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative max-w-sm flex-1 sm:min-w-72">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por ID, cliente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="failed">Fallido</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="all">
          <PaymentsTable rows={filteredPayments} showStatus allowRefund />
        </TabsContent>

        <TabsContent value="completed">
          <PaymentsTable rows={payments.filter((p) => p.status === "completed")} allowRefund />
        </TabsContent>

        <TabsContent value="pending">
          <PaymentsTable rows={payments.filter((p) => p.status === "pending")} showStatus={false} />
        </TabsContent>

        <TabsContent value="failed">
          <PaymentsTable rows={payments.filter((p) => p.status === "failed")} showStatus={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
