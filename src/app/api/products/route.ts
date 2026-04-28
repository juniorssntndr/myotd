import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transformProduct } from "@/lib/transformers"
import { requireAdmin } from "@/lib/api-auth"
import { normalizeProductImageList } from "@/lib/image-url"

type ProductVariantInput = {
  id?: string
  sku: string
  size: string
  color: string
  stock: number
}

type ProductInput = {
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  images?: string[]
  isNew?: boolean
  isFeatured?: boolean
  isActive?: boolean
  categoryId: string
  brandId: string
  variants: ProductVariantInput[]
}

function normalizeSort(sortBy: string) {
  switch (sortBy) {
    case "price-asc":
      return { price: "asc" as const }
    case "price-desc":
      return { price: "desc" as const }
    case "rating":
    case "popular":
      return { createdAt: "desc" as const }
    default:
      return { createdAt: "desc" as const }
  }
}

function validateProductInput(body: ProductInput): string | null {
  if (!body.name || !body.slug || !body.categoryId || !body.brandId) {
    return "name, slug, categoryId y brandId son requeridos"
  }

  if (!Array.isArray(body.variants) || body.variants.length === 0) {
    return "Debes registrar al menos una variante"
  }

  const invalidVariant = body.variants.find(
    (variant) => !variant.sku || !variant.size || !variant.color || Number.isNaN(Number(variant.stock))
  )

  if (invalidVariant) {
    return "Todas las variantes deben incluir sku, talla, color y stock"
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get("category")
    const brand = searchParams.get("brand")
    const size = searchParams.get("size")
    const color = searchParams.get("color")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "newest"
    const featured = searchParams.get("featured")
    const isNew = searchParams.get("new")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (category) {
      where.category = { slug: category }
    }

    if (brand) {
      where.brand = { slug: brand }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, number>).gte = Number(minPrice)
      if (maxPrice) (where.price as Record<string, number>).lte = Number(maxPrice)
    }

    if (featured === "true") {
      where.isFeatured = true
    }

    if (isNew === "true") {
      where.isNew = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (size || color) {
      where.variants = {
        some: {
          ...(size ? { size } : {}),
          ...(color ? { color } : {}),
          stock: { gt: 0 },
        },
      }
    }

    const orderBy = normalizeSort(sortBy)
    const take = limit ? Number(limit) : undefined
    const skip = offset ? Number(offset) : undefined

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        brand: true,
        variants: true,
      },
      take,
      skip,
    })

    const transformed = products.map(transformProduct)

    const sorted =
      sortBy === "popular"
        ? transformed.sort(
            (a, b) =>
              b.variants.reduce((sum, variant) => sum + variant.stock, 0) -
              a.variants.reduce((sum, variant) => sum + variant.stock, 0)
          )
        : sortBy === "rating"
        ? transformed.sort((a, b) => b.rating - a.rating)
        : transformed

    const total = await prisma.product.count({ where })

    return NextResponse.json({
      products: sorted,
      total,
      page: skip ? Math.floor(skip / (take || 20)) + 1 : 1,
      pageSize: take || sorted.length,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response } = await requireAdmin()
    if (response) {
      return response
    }

    const body: ProductInput = await request.json()
    const validationError = validateProductInput(body)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        comparePrice: body.comparePrice,
        images: normalizeProductImageList(body.images),
        specs: {},
        isNew: body.isNew || false,
        isFeatured: body.isFeatured || false,
        isActive: body.isActive ?? true,
        categoryId: body.categoryId,
        brandId: body.brandId,
        variants: {
          create: body.variants.map((variant) => ({
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
          })),
        },
      },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    })

    return NextResponse.json(transformProduct(product), { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}
