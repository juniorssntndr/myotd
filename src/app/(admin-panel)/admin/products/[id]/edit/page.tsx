"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ProductImageManager } from "@/components/admin/ProductImageManager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InlineCreateDialog, InlineCreateButton } from "@/components/admin/InlineCreateDialog"
import { useCategoriesStore } from "@/stores/categories-store"
import { useBrandsStore } from "@/stores/brands-store"

type VariantInput = {
  id?: string
  sku: string
  size: string
  color: string
  stock: number
}

type ProductInput = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  variants: VariantInput[]
  isNew: boolean
  isFeatured: boolean
  isActive: boolean
  category: string
  categoryId: string
  brand: string
  brandId: string
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { categories, addCategory, fetchCategories } = useCategoriesStore()
  const { brands, addBrand, fetchBrands } = useBrandsStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<ProductInput | null>(null)
  const [categoryId, setCategoryId] = useState("")
  const [brandId, setBrandId] = useState("")
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [brandDialogOpen, setBrandDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchCategories(), fetchBrands()])

      try {
        const response = await fetch(`/api/products/${params.id}`)

        if (!response.ok) {
          toast.error("El producto no existe o fue eliminado.")
          router.push("/admin/products")
          return
        }

        const productData = await response.json()

        setCategoryId(productData.categoryId || "")
        setBrandId(productData.brandId || "")

        if (!productData.variants) {
          productData.variants = []
        }

        setProduct(productData)
      } catch (error) {
        console.error("Error loading product:", error)
        toast.error("Error al cargar el producto")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, fetchCategories, fetchBrands, router])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleCreateCategory = async (name: string) => {
    try {
      const slug = generateSlug(name)
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, icon: "" }),
      })

      if (!response.ok) {
        throw new Error("Error creating category")
      }

      const newCategory = await response.json()
      addCategory(newCategory)
      setCategoryId(newCategory.id)
      toast.success("Categoría creada correctamente")
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("No se pudo crear la categoría")
      throw error
    }
  }

  const handleCreateBrand = async (name: string) => {
    try {
      const slug = generateSlug(name)
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, logo: "" }),
      })

      if (!response.ok) {
        throw new Error("Error creating brand")
      }

      const newBrand = await response.json()
      addBrand(newBrand)
      setBrandId(newBrand.id)
      toast.success("Marca creada correctamente")
    } catch (error) {
      console.error("Error creating brand:", error)
      toast.error("No se pudo crear la marca")
      throw error
    }
  }

  const updateProductField = <K extends keyof ProductInput>(field: K, value: ProductInput[K]) => {
    setProduct((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const updateVariant = (index: number, field: keyof VariantInput, value: string | number) => {
    setProduct((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        variants: prev.variants.map((variant, variantIndex) =>
          variantIndex === index ? { ...variant, [field]: value } : variant
        ),
      }
    })
  }

  const addVariant = () => {
    setProduct((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        variants: [...prev.variants, { size: "", color: "", stock: 0, sku: "" }],
      }
    })
  }

  const removeVariant = (index: number) => {
    setProduct((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        variants: prev.variants.filter((_, variantIndex) => variantIndex !== index),
      }
    })
  }

  const generateSku = (productName: string, size: string, color: string) => {
    const prefix = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4)
    const sizeCode = size.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const colorCode = color.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)
    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}-${sizeCode}-${colorCode}-${uniqueSuffix}`
  }

  const handleSubmit = async () => {
    if (!product) return

    if (!categoryId) {
      toast.error("Debes seleccionar una categoría")
      return
    }

    if (!brandId) {
      toast.error("Debes seleccionar una marca")
      return
    }

    const incompleteVariants = product.variants.filter((v) => !v.size || !v.color)
    if (incompleteVariants.length > 0) {
      toast.error("Todas las variantes deben tener talla y color")
      return
    }

    const duplicateSkus = product.variants.filter(
      (v, i, arr) => arr.findIndex((a) => a.sku === v.sku && v.sku !== "") !== i
    )
    if (duplicateSkus.length > 0) {
      toast.error("Hay variantes con SKUs duplicados")
      return
    }

    if (product.images.filter((image) => image.trim().length > 0).length === 0) {
      toast.error("Debes registrar al menos una imagen")
      return
    }

    setSaving(true)
    try {
      const variantsWithSku = product.variants.map((v) => ({
        ...v,
        sku: v.sku || generateSku(product.name, v.size, v.color),
      }))

      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: isNaN(product.price) ? 0 : product.price,
          comparePrice: product.originalPrice && !isNaN(product.originalPrice) ? product.originalPrice : undefined,
          images: product.images,
          categoryId,
          brandId,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          variants: variantsWithSku,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || "Error updating product")
      }

      toast.success("Cambios guardados correctamente")
      router.push("/admin/products")
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo actualizar el producto"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <InlineCreateDialog
        title="Crear nueva categoría"
        isOpen={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        onSave={handleCreateCategory}
      />
      <InlineCreateDialog
        title="Crear nueva marca"
        isOpen={brandDialogOpen}
        onClose={() => setBrandDialogOpen(false)}
        onSave={handleCreateBrand}
      />

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar producto</h1>
          <p className="text-muted-foreground">Ajusta datos, variantes y stock por talla/color</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>Campos principales del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={product.name} onChange={(event) => updateProductField("name", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={product.slug} onChange={(event) => updateProductField("slug", event.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                rows={4}
                value={product.description}
                onChange={(event) => updateProductField("description", event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <div className="flex gap-2">
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InlineCreateButton onClick={() => setCategoryDialogOpen(true)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Marca</Label>
                <div className="flex gap-2">
                  <Select value={brandId} onValueChange={setBrandId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InlineCreateButton onClick={() => setBrandDialogOpen(true)} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Precio (S/)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={(event) => updateProductField("price", Number(event.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Precio anterior</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={product.originalPrice || 0}
                  onChange={(event) => updateProductField("originalPrice", Number(event.target.value) || undefined)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variantes</CardTitle>
            <CardDescription>Gestión de stock por talla/color</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="hidden sm:grid sm:grid-cols-3 gap-2 px-1 text-sm font-medium text-muted-foreground">
              <span>Talla</span>
              <span>Color</span>
              <span>Stock</span>
            </div>
            {product.variants.map((variant, index) => (
              <div key={variant.id || `variant-${index}`} className="grid gap-2 rounded-md border p-3 sm:grid-cols-3">
                <Input
                  placeholder="Talla (S, M, 42...)"
                  value={variant.size}
                  onChange={(event) => updateVariant(index, "size", event.target.value)}
                />
                <Input
                  placeholder="Color (Negro, Blanco...)"
                  value={variant.color}
                  onChange={(event) => updateVariant(index, "color", event.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Stock"
                    value={variant.stock}
                    onChange={(event) => updateVariant(index, "stock", Number(event.target.value))}
                  />
                  {product.variants.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeVariant(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addVariant}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar variante
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
            <CardDescription>
              Pega URLs completas o paths de Imgix. La primera imagen se usa como portada del catálogo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductImageManager
              value={product.images}
              onChange={(images) => updateProductField("images", images)}
              maxImages={5}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
            <CardDescription>Visibilidad del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-new"
                checked={product.isNew}
                onCheckedChange={(checked) => updateProductField("isNew", Boolean(checked))}
              />
              <Label htmlFor="is-new">Producto nuevo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-featured"
                checked={product.isFeatured}
                onCheckedChange={(checked) => updateProductField("isFeatured", Boolean(checked))}
              />
              <Label htmlFor="is-featured">Producto destacado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-active"
                checked={product.isActive}
                onCheckedChange={(checked) => updateProductField("isActive", Boolean(checked))}
              />
              <Label htmlFor="is-active">Visible en tienda</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/products">Cancelar</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
