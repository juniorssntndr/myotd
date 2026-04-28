"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductImageManager } from "@/components/admin/ProductImageManager"
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

interface ProductVariantInput {
  id?: string
  size: string
  color: string
  stock: number
}

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  comparePrice: z.number().optional(),
  categoryId: z.string().min(1, "La categoría es requerida"),
  brandId: z.string().min(1, "La marca es requerida"),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

const EMPTY_VARIANT: ProductVariantInput = {
  size: "",
  color: "",
  stock: 0,
}

export default function NewProductPage() {
  const router = useRouter()
  const { categories, addCategory, fetchCategories } = useCategoriesStore()
  const { brands, addBrand, fetchBrands } = useBrandsStore()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<ProductVariantInput[]>([{ ...EMPTY_VARIANT }])
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [brandDialogOpen, setBrandDialogOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchBrands()])
      setLoading(false)
    }
    loadData()
  }, [fetchCategories, fetchBrands])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isNew: false,
      isFeatured: false,
    },
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const generateSku = (productName: string, size: string, color: string) => {
    const prefix = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4)
    const sizeCode = size.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const colorCode = color.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)
    return `${prefix}-${sizeCode}-${colorCode}`
  }

  const updateVariant = (index: number, field: keyof ProductVariantInput, value: string | number) => {
    setVariants((previous) =>
      previous.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant
      )
    )
  }

  const addVariant = () => {
    setVariants((previous) => [...previous, { ...EMPTY_VARIANT }])
  }

  const removeVariant = (index: number) => {
    setVariants((previous) => previous.filter((_, variantIndex) => variantIndex !== index))
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
      setValue("categoryId", newCategory.id)
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
      setValue("brandId", newBrand.id)
    } catch (error) {
      console.error("Error creating brand:", error)
      toast.error("No se pudo crear la marca")
      throw error
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    if (images.filter((image) => image.trim().length > 0).length === 0) {
      toast.error("Debes subir al menos una imagen")
      return
    }

    const incompleteVariants = variants.filter((v) => !v.size || !v.color)
    if (incompleteVariants.length > 0) {
      toast.error("Todas las variantes deben tener talla y color")
      return
    }

    const validVariants = variants.filter(
      (variant) => variant.size && variant.color && variant.stock >= 0
    )

    if (validVariants.length === 0) {
      toast.error("Debes registrar al menos una variante válida")
      return
    }

    const variantsWithSku = validVariants.map((v) => ({
      ...v,
      sku: generateSku(data.name, v.size, v.color),
    }))

    setSaving(true)

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images,
          variants: variantsWithSku,
          isActive: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Error creating product")
      }

      toast.success("Producto guardado correctamente")
      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error("No se pudo crear el producto")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
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
          <h1 className="text-2xl font-bold">Nuevo producto</h1>
          <p className="text-muted-foreground">Agrega un nuevo producto al catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>Datos principales del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre del producto"
                  {...register("name", {
                    onChange: (event) => {
                      setValue("slug", generateSlug(event.target.value))
                    },
                  })}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" placeholder="nombre-del-producto" {...register("slug")} />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción detallada del producto"
                rows={4}
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => setValue("categoryId", value)}>
                    <SelectTrigger id="categoryId" className="flex-1">
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
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandId">Marca</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => setValue("brandId", value)}>
                    <SelectTrigger id="brandId" className="flex-1">
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
                {errors.brandId && <p className="text-sm text-destructive">{errors.brandId.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precio</CardTitle>
            <CardDescription>Configura precio de venta</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (S/)</Label>
              <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Precio anterior (opcional)</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                {...register("comparePrice", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variantes</CardTitle>
            <CardDescription>Talla, color y stock por combinación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="hidden sm:grid sm:grid-cols-3 gap-2 px-1 text-sm font-medium text-muted-foreground">
              <span>Talla</span>
              <span>Color</span>
              <span>Stock</span>
            </div>
            {variants.map((variant, index) => (
              <div key={`variant-${index}`} className="grid gap-2 rounded-md border p-3 sm:grid-cols-3">
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
                  {variants.length > 1 && (
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
              Pega URLs completas o paths de Imgix. La primera imagen será la portada del catálogo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductImageManager value={images} onChange={setImages} maxImages={5} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opciones</CardTitle>
            <CardDescription>Configuraciones adicionales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNew"
                checked={watch("isNew")}
                onCheckedChange={(checked) => setValue("isNew", Boolean(checked))}
              />
              <Label htmlFor="isNew" className="font-normal">
                Marcar como producto nuevo
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={watch("isFeatured")}
                onCheckedChange={(checked) => setValue("isFeatured", Boolean(checked))}
              />
              <Label htmlFor="isFeatured" className="font-normal">
                Mostrar en destacados
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar producto"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
