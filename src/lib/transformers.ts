import type { Product, Category, Brand } from "@/types"
import type {
  Product as PrismaProduct,
  Category as PrismaCategory,
  Brand as PrismaBrand,
  ProductVariant,
} from "@/generated/client"
import { resolveProductImageList } from "@/lib/image-url"

type ProductWithRelations = PrismaProduct & {
  category: PrismaCategory
  brand: PrismaBrand
  variants?: ProductVariant[]
}

type CategoryWithCount = PrismaCategory & {
  _count?: { products: number }
}

type BrandWithCount = PrismaBrand & {
  _count?: { products: number }
}

export function transformProduct(product: ProductWithRelations): Product {
  const sizes = [...new Set(product.variants?.map((v) => v.size) || [])]
  const colors = [...new Set(product.variants?.map((v) => v.color) || [])]
  const specs = (product.specs as Record<string, unknown> | null) || {}
  const shortDescription =
    typeof specs.shortDescription === "string" ? specs.shortDescription : ""

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand.name,
    brandId: product.brandId,
    category: product.category.slug,
    categoryId: product.categoryId,
    price: Number(product.price),
    originalPrice: product.comparePrice ? Number(product.comparePrice) : undefined,
    images: resolveProductImageList(product.images),
    shortDescription,
    description: product.description || "",
    variants: product.variants?.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
    })) || [],
    sizes,
    colors,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    rating: 4.5,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

export function transformCategory(category: CategoryWithCount): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon || "Package",
    productCount: category._count?.products || 0,
  }
}

export function transformBrand(brand: BrandWithCount): Brand {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo || undefined,
    productCount: brand._count?.products || 0,
  }
}
