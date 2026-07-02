import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transformProduct } from "@/lib/transformers"
import { requireAdmin } from "@/lib/api-auth"
import { normalizeProductImageList } from "@/lib/image-url"
import { NO_SIZE_VALUE } from "@/lib/product-options"

type Params = Promise<{ id: string }>

type ProductVariantInput = {
  id?: string
  sku: string
  size: string
  color: string
  stock: number
}

type ProductUpdateInput = {
  name?: string
  slug?: string
  description?: string
  price?: number
  comparePrice?: number
  images?: string[]
  isNew?: boolean
  isFeatured?: boolean
  isActive?: boolean
  categoryId?: string
  brandId?: string
  variants?: ProductVariantInput[]
  noSize?: boolean
}

function normalizeVariants(variants: ProductVariantInput[], noSize: boolean) {
  return variants.map((variant) => ({
    ...variant,
    size: noSize ? NO_SIZE_VALUE : variant.size?.trim() || "",
    color: variant.color?.trim() || "",
    sku: variant.sku?.trim() || "",
  }))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    })

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(transformProduct(product))
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { response } = await requireAdmin()
    if (response) {
      return response
    }

    const { id } = await params
    const body: ProductUpdateInput = await request.json()

    if (Array.isArray(body.variants) && body.variants.length === 0) {
      return NextResponse.json(
        { error: "Debes mantener al menos una variante" },
        { status: 400 }
      )
    }

    const normalizedVariants = Array.isArray(body.variants)
      ? normalizeVariants(body.variants, Boolean(body.noSize))
      : undefined

    if (normalizedVariants?.some((variant) => !variant.sku || !variant.size || !variant.color || Number.isNaN(Number(variant.stock)))) {
      return NextResponse.json(
        {
          error: body.noSize
            ? "Todas las variantes deben incluir sku, color y stock"
            : "Todas las variantes deben incluir sku, talla, color y stock",
        },
        { status: 400 }
      )
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.slug !== undefined ? { slug: body.slug } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.price !== undefined ? { price: body.price } : {}),
          ...(body.comparePrice !== undefined ? { comparePrice: body.comparePrice } : {}),
          ...(body.images !== undefined ? { images: normalizeProductImageList(body.images) } : {}),
          ...(body.isNew !== undefined ? { isNew: body.isNew } : {}),
          ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
          ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
          ...(body.brandId !== undefined ? { brandId: body.brandId } : {}),
        },
      })

      if (normalizedVariants && normalizedVariants.length > 0) {
        const existingIds = new Set(existing.variants.map((variant) => variant.id))
        const incomingById = new Map(
          normalizedVariants.filter((variant) => Boolean(variant.id)).map((variant) => [variant.id as string, variant])
        )
        const incomingIds = new Set(
          normalizedVariants
            .map((variant) => variant.id)
            .filter((variantId): variantId is string => Boolean(variantId))
        )

        for (const variant of existing.variants) {
          const next = incomingById.get(variant.id)
          if (next) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                sku: next.sku,
                size: next.size,
                color: next.color,
                stock: next.stock,
              },
            })
          }
        }

        const newVariants = normalizedVariants.filter((variant) => !variant.id)
        if (newVariants.length > 0) {
          await tx.productVariant.createMany({
            data: newVariants.map((variant) => ({
              productId: id,
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
            })),
          })
        }

        const variantsToDelete = [...existingIds].filter(
          (variantId) => !incomingIds.has(variantId)
        )

        if (variantsToDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: {
              id: { in: variantsToDelete },
              orderItems: { none: {} },
            },
          })

          await tx.productVariant.updateMany({
            where: {
              id: { in: variantsToDelete },
            },
            data: {
              stock: 0,
            },
          })
        }
      }

      return updated
    })

    const hydrated = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    })

    if (!hydrated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(transformProduct(hydrated))
  } catch (error: unknown) {
    console.error("Error updating product:", error)
    const message =
      error instanceof Error ? error.message : "Error updating product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { response } = await requireAdmin()
    if (response) {
      return response
    }

    const { id } = await params

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
      select: { id: true },
    })

    return NextResponse.json({ success: true, id: product.id })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 })
  }
}
