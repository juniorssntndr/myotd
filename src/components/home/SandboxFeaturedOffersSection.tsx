import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { products as mockProducts } from "@/data/mock-products"
import { SandboxFeaturedOffersCarousel } from "@/components/home/SandboxFeaturedOffersCarousel"
import { resolveProductImageUrl } from "@/lib/image-url"

export type FeaturedOfferCard = {
  id: string
  title: string
  subtitle: string
  discount: string
  href: string
  image: string
  tone: string
}

type OfferSource = {
  id: string
  image: string
  brandName: string
  categoryName: string
  categorySlug: string
  price: number
  originalPrice?: number | null
}

const offerTones = [
  "from-stone-900/75 via-amber-900/45 to-black/60",
  "from-slate-900/75 via-neutral-800/50 to-black/60",
  "from-emerald-900/75 via-teal-800/45 to-black/60",
  "from-indigo-950/75 via-violet-900/45 to-black/60",
  "from-rose-950/75 via-red-900/45 to-black/60",
]

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
  const n = productCount === 1 ? "1 producto" : `${productCount} productos`

  if (firstBrand && secondBrand) {
    return `${n} con descuento de ${firstBrand}, ${secondBrand} y más.`
  }

  if (firstBrand) {
    return `${n} con descuento de ${firstBrand}.`
  }

  return productCount === 1
    ? "1 producto con descuento disponible por tiempo limitado."
    : `${n} con descuento disponibles por tiempo limitado.`
}

function buildOffers(items: OfferSource[]): FeaturedOfferCard[] {
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

    if (!item.image || discount <= 0) {
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
        image: item.image,
      })
      continue
    }

    existing.brands.add(item.brandName)
    existing.productCount += 1

    if (discount > existing.maxDiscount) {
      existing.maxDiscount = discount
      existing.image = item.image
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
      tone: offerTones[index % offerTones.length],
    }))
}

async function getOfferCards(): Promise<FeaturedOfferCard[]> {
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

export async function SandboxFeaturedOffersSection() {
  const offers = await getOfferCards()

  if (offers.length === 0) {
    return null
  }

  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-7">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Featured Offer For You</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Ofertas destacadas</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            See All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <SandboxFeaturedOffersCarousel offers={offers} />
      </div>
    </section>
  )
}
