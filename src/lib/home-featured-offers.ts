import { prisma } from "@/lib/prisma"
import { products as mockProducts } from "@/data/mock-products"
import { resolveProductImageUrl, sanitizeImageUrl } from "@/lib/image-url"
import {
  OFFER_TONE_KEYS,
  type HomeFeaturedOfferCard,
} from "@/lib/home-featured-offers.shared"

export type { HomeFeaturedOfferCard, OfferToneKey } from "@/lib/home-featured-offers.shared"
export {
  OFFER_TONE_CLASSES,
  OFFER_TONE_KEYS,
  OFFER_TONE_LABELS,
  offerToneClassForKey,
} from "@/lib/home-featured-offers.shared"

type OfferSource = {
  id: string
  image: string
  brandName: string
  categoryName: string
  categorySlug: string
  price: number
  originalPrice?: number | null
}

function formatCategoryName(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

function getDiscount(price: number, originalPrice?: number | null) {
  if (typeof originalPrice !== "number" || originalPrice <= price) {
    return 0
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

function buildSubtitle(productCount: number, brands: string[]) {
  const [firstBrand, secondBrand] = brands

  if (firstBrand && secondBrand) {
    return `${productCount} productos con descuento de ${firstBrand}, ${secondBrand} y más.`
  }

  if (firstBrand) {
    return `${productCount} productos con descuento de ${firstBrand}.`
  }

  return `${productCount} productos con descuento disponibles por tiempo limitado.`
}

export function buildOffers(items: OfferSource[]): HomeFeaturedOfferCard[] {
  const grouped = new Map<
    string,
    {
      categoryName: string
      categorySlug: string
      brands: Set<string>
      productCount: number
      maxDiscount: number
      image: string
    }
  >()

  for (const item of items) {
    const discount = getDiscount(item.price, item.originalPrice)
    const image = sanitizeImageUrl(item.image)

    if (!image || discount <= 0) {
      continue
    }

    const existing = grouped.get(item.categorySlug)

    if (!existing) {
      grouped.set(item.categorySlug, {
        categoryName: item.categoryName,
        categorySlug: item.categorySlug,
        brands: new Set([item.brandName]),
        productCount: 1,
        maxDiscount: discount,
        image,
      })
      continue
    }

    existing.brands.add(item.brandName)
    existing.productCount += 1

    if (discount > existing.maxDiscount) {
      existing.maxDiscount = discount
      existing.image = image
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => {
      if (b.maxDiscount !== a.maxDiscount) {
        return b.maxDiscount - a.maxDiscount
      }

      return b.productCount - a.productCount
    })
    .slice(0, 5)
    .map((group, index) => ({
      id: group.categorySlug,
      title: `${group.categoryName} en oferta`,
      subtitle: buildSubtitle(group.productCount, Array.from(group.brands).slice(0, 3)),
      discount: `HASTA ${group.maxDiscount}% OFF`,
      href: `/products?category=${group.categorySlug}`,
      image: group.image,
      toneKey: OFFER_TONE_KEYS[index % OFFER_TONE_KEYS.length],
    }))
}

export async function getHomeFeaturedOfferCards(): Promise<HomeFeaturedOfferCard[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        comparePrice: { not: null },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 36,
      select: {
        id: true,
        price: true,
        comparePrice: true,
        images: true,
        brand: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    const dbOffers = buildOffers(
      products.map((product) => ({
        id: product.id,
        image: resolveProductImageUrl(product.images[0] ?? ""),
        brandName: product.brand.name,
        categoryName: product.category.name,
        categorySlug: product.category.slug,
        price: Number(product.price),
        originalPrice: product.comparePrice ? Number(product.comparePrice) : null,
      }))
    )

    if (dbOffers.length > 0) {
      return dbOffers
    }
  } catch {
    // Fallback to mock data when the database is unavailable.
  }

  return buildOffers(
    mockProducts.map((product) => ({
      id: product.id,
      image: product.images[0] ?? "",
      brandName: product.brand,
      categoryName: formatCategoryName(product.category),
      categorySlug: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
    }))
  )
}
