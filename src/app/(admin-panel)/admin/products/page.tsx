"use client"

import { useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  AlertTriangle,
  Boxes,
  Eye,
  Loader2,
  MoreHorizontal,
  PackageOpen,
  PackageX,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { InventoryHealthChart } from "@/components/admin/InventoryHealthChart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  price: number
  originalPrice?: number
  images: string[]
  variants: Array<{
    id: string
    stock: number
    size: string
    color: string
  }>
  isNew: boolean
  isFeatured: boolean
  isActive: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

const LOW_STOCK_THRESHOLD = 5
const numberFormatter = new Intl.NumberFormat("es-PE")

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function ProductMetricPane({
  title,
  subtitle,
  value,
  helper,
  icon: Icon,
  accent = "muted",
  valueClassName,
}: {
  title: string
  subtitle: string
  value: string
  helper: string
  icon: LucideIcon
  accent?: "brand" | "muted" | "warning" | "danger"
  valueClassName?: string
}) {
  const accentClassName =
    accent === "brand"
      ? "bg-[var(--myotd-red-soft)] text-[var(--myotd-red)]"
      : accent === "warning"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : accent === "danger"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      : "bg-muted/60 text-muted-foreground"

  return (
    <div className="flex h-full flex-col justify-between gap-3 p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${accentClassName}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="space-y-2">
        <p className={valueClassName || "text-[clamp(1.7rem,2vw,2.2rem)] font-semibold tracking-tight"}>{value}</p>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </div>
    </div>
  )
}

function ProductsSummaryBand({
  productsCount,
  categoriesCount,
  inventoryUnits,
  lowStockCount,
  outOfStockCount,
  activeProducts,
  featuredProducts,
}: {
  productsCount: number
  categoriesCount: number
  inventoryUnits: number
  lowStockCount: number
  outOfStockCount: number
  activeProducts: number
  featuredProducts: number
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <CardContent className="p-0">
        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)] xl:divide-x xl:divide-border/60">
          <div className="flex flex-col gap-4 p-4 lg:p-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-[var(--myotd-red-border)] bg-[var(--myotd-red-soft)] text-[var(--myotd-red)] hover:bg-[var(--myotd-red-soft)]">
                  Catálogo
                </Badge>
                <span className="text-xs text-muted-foreground">Vista general del inventario</span>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Total de productos
                </p>
                <h2 className="text-[clamp(2.2rem,3.3vw,3.4rem)] font-semibold tracking-tight">
                  {formatNumber(productsCount)}
                </h2>
              </div>

              <p className="text-sm text-muted-foreground">
                {formatNumber(categoriesCount)} categorías activas · {formatNumber(activeProducts)} visibles en catálogo.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Inventario</p>
                <p className="mt-1 font-medium text-foreground">{formatNumber(inventoryUnits)} unidades</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Destacados</p>
                <p className="mt-1 font-medium text-foreground">{formatNumber(featuredProducts)} en vitrina</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Disponibles</p>
                <p className="mt-1 font-medium text-foreground">{formatNumber(productsCount - outOfStockCount)} con stock</p>
              </div>
            </div>
          </div>

          <ProductMetricPane
            title="Inventario total"
            subtitle="Unidades acumuladas en variantes"
            value={formatNumber(inventoryUnits)}
            helper={`${formatNumber(featuredProducts)} productos destacados`}
            icon={Boxes}
            accent="muted"
          />
          <ProductMetricPane
            title="Stock bajo"
            subtitle={`Umbral actual: ${LOW_STOCK_THRESHOLD} unidades`}
            value={formatNumber(lowStockCount)}
            helper="Requieren reposición prioritaria"
            icon={AlertTriangle}
            accent="warning"
            valueClassName="text-[clamp(1.7rem,2vw,2.2rem)] font-semibold tracking-tight text-amber-600 dark:text-amber-400"
          />
          <ProductMetricPane
            title="Agotados"
            subtitle="Sin unidades disponibles"
            value={formatNumber(outOfStockCount)}
            helper="Impactan la conversión del catálogo"
            icon={PackageX}
            accent="danger"
            valueClassName="text-[clamp(1.7rem,2vw,2.2rem)] font-semibold tracking-tight text-rose-600 dark:text-rose-400"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ProductsSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Imagen</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
            <TableCell>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1 h-3 w-20" />
            </TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ])

        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()

        setProducts(productsData.products || [])
        setCategories(categoriesData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setProducts(products.filter((p) => p.id !== deleteId))
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getTotalStock = (product: Product) =>
    product.variants.reduce((sum, variant) => sum + variant.stock, 0)

  const inventoryUnits = products.reduce((sum, product) => sum + getTotalStock(product), 0)
  const inStockCount = products.filter((p) => getTotalStock(p) > 0).length
  const outOfStockCount = products.filter((p) => getTotalStock(p) === 0).length
  const lowStockCount = products.filter((p) => {
    const stock = getTotalStock(p)
    return stock > 0 && stock <= LOW_STOCK_THRESHOLD
  }).length
  const healthyStockCount = products.filter((p) => getTotalStock(p) > LOW_STOCK_THRESHOLD).length
  const activeProducts = products.filter((p) => p.isActive).length
  const featuredProducts = products.filter((p) => p.isFeatured).length
  const categoryLabelMap = new Map(categories.map((category) => [category.slug, category.name]))
  const criticalProducts = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: categoryLabelMap.get(product.category) || product.category,
      stock: getTotalStock(product),
    }))
    .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
    .sort((left, right) => left.stock - right.stock)
    .slice(0, 5)

  const inventoryHealthData = [
    { name: "Estable", value: healthyStockCount, fill: "var(--myotd-red-muted)" },
    { name: "Stock bajo", value: lowStockCount, fill: "#f59e0b" },
    { name: "Agotados", value: outOfStockCount, fill: "var(--myotd-red)" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Administra el catálogo de productos de tu tienda
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <ProductsSummaryBand
        productsCount={products.length}
        categoriesCount={categories.length}
        inventoryUnits={inventoryUnits}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        activeProducts={activeProducts}
        featuredProducts={featuredProducts}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,0.95fr)]">
        <InventoryHealthChart data={inventoryHealthData} />

        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle>Radar operativo</CardTitle>
            <CardDescription>Lo esencial para detectar urgencia, visibilidad y riesgo del catálogo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4">
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <div className="divide-y divide-border/60">
                <div className="flex items-start justify-between gap-3 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium">Disponibilidad</p>
                    <p className="mt-1 text-xs text-muted-foreground">Productos con stock disponible.</p>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight">{formatNumber(inStockCount)}</p>
                </div>
                <div className="flex items-start justify-between gap-3 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium">Destacados</p>
                    <p className="mt-1 text-xs text-muted-foreground">Con prioridad comercial en vitrina.</p>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight">{formatNumber(featuredProducts)}</p>
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-border/60 px-3 py-3.5">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <PackageOpen className="h-4 w-4 text-[var(--myotd-red)]" />
                  Productos críticos
                </h3>
                <p className="text-xs text-muted-foreground">Agotamiento o stock por debajo del umbral.</p>
              </div>

              {criticalProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/[0.16] px-3 py-4 text-sm text-muted-foreground">
                  No hay productos en riesgo inmediato.
                </div>
              ) : (
                <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-muted/[0.12]">
                  {criticalProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                        {product.stock === 0 ? "Agotado" : `${product.stock} u.`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Catálogo de productos</CardTitle>
          <CardDescription>
            {filteredProducts.length} resultado{filteredProducts.length === 1 ? "" : "s"} visibles con el filtro actual
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <ProductsSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                          {product.images[0] && (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>S/ {product.price.toFixed(2)}</TableCell>
                      <TableCell>{getTotalStock(product)}</TableCell>
                      <TableCell>
                        {getTotalStock(product) > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            En stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Agotado</Badge>
                        )}
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
                              <Link href={`/products/${product.slug}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
