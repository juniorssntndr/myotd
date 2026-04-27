"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Ban, Eye, Mail, MoreHorizontal, Search, Shield, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
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
  DropdownMenuSeparator,
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
import { useAdminStore } from "@/stores/admin-store"

const statusConfig = {
  active: { label: "Activo", variant: "default" as const, className: "bg-green-600" },
  inactive: { label: "Inactivo", variant: "secondary" as const, className: "" },
  suspended: { label: "Suspendido", variant: "destructive" as const, className: "" },
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  customer: "Cliente",
}

const numberFormatter = new Intl.NumberFormat("es-PE")
const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
})

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function UsersSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[208px] rounded-2xl" />
      <Skeleton className="h-[76px] rounded-2xl" />
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  )
}

function UserMetricPane({
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
  accent?: "brand" | "muted" | "success"
}) {
  const accentClassName =
    accent === "brand"
      ? "bg-[var(--myotd-red-soft)] text-[var(--myotd-red)]"
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

function UsersSummaryBand({
  usersCount,
  activeUsers,
  adminUsers,
  totalSpent,
  customerUsers,
}: {
  usersCount: number
  activeUsers: number
  adminUsers: number
  totalSpent: number
  customerUsers: number
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <CardContent className="p-0">
        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)] xl:divide-x xl:divide-border/60">
          <div className="flex flex-col gap-4 p-4 lg:p-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-[var(--myotd-red-border)] bg-[var(--myotd-red-soft)] text-[var(--myotd-red)] hover:bg-[var(--myotd-red-soft)]">
                  Comunidad
                </Badge>
                <span className="text-xs text-muted-foreground">Gestión de clientes, admins y actividad</span>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Total usuarios</p>
                <h2 className="text-[clamp(2.2rem,3.3vw,3.4rem)] font-semibold tracking-tight">{formatNumber(usersCount)}</h2>
              </div>

              <p className="text-sm text-muted-foreground">
                {formatNumber(customerUsers)} clientes y {formatNumber(adminUsers)} perfiles administrativos registrados.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Activos</p>
                <p className="mt-1 font-medium text-foreground">{formatNumber(activeUsers)}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Admins</p>
                <p className="mt-1 font-medium text-foreground">{formatNumber(adminUsers)}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Total gastado</p>
                <p className="mt-1 font-medium text-foreground">{currencyFormatter.format(totalSpent)}</p>
              </div>
            </div>
          </div>

          <UserMetricPane
            title="Usuarios activos"
            subtitle="Base actualmente operativa"
            value={formatNumber(activeUsers)}
            helper="Cuentas habilitadas para comprar o gestionar."
            icon={Users}
            accent="success"
          />
          <UserMetricPane
            title="Administradores"
            subtitle="Perfiles con acceso elevado"
            value={formatNumber(adminUsers)}
            helper="Usuarios con permisos de administración."
            icon={Shield}
            accent="muted"
          />
          <UserMetricPane
            title="Total gastado"
            subtitle="Valor histórico de la base"
            value={currencyFormatter.format(totalSpent)}
            helper="Acumulado de compras registradas."
            icon={UserPlus}
            accent="brand"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminUsersPage() {
  const { users, loading, fetchUsers } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const activeUsers = users.filter((u) => u.status === "active").length
  const adminUsers = users.filter((u) => u.role === "admin").length
  const totalSpent = users.reduce((sum, u) => sum + u.totalSpent, 0)
  const customerUsers = users.filter((u) => u.role === "customer").length

  if (loading && users.length === 0) {
    return <UsersSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios y clientes de tu tienda.</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Link>
        </Button>
      </div>

      <UsersSummaryBand
        usersCount={users.length}
        activeUsers={activeUsers}
        adminUsers={adminUsers}
        totalSpent={totalSpent}
        customerUsers={customerUsers}
      />

      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative max-w-sm flex-1 sm:min-w-72">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="customer">Clientes</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Total Gastado</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const status = statusConfig[user.status as keyof typeof statusConfig] || statusConfig.active
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.orders}</TableCell>
                      <TableCell>S/ {user.totalSpent.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("es-PE")}
                      </TableCell>
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
                              Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Enviar email
                            </DropdownMenuItem>
                            {user.role !== "admin" ? (
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Hacer admin
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            {user.status !== "suspended" ? (
                              <DropdownMenuItem className="text-destructive">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspender
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>Reactivar cuenta</DropdownMenuItem>
                            )}
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
    </div>
  )
}
