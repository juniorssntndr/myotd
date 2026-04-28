import { prisma } from "@/lib/prisma"
import { brands as mockBrands, products as mockProducts } from "@/data/mock-products"
import { SandboxSponsoredCarousel, type SandboxSponsoredItem } from "@/components/home/SandboxSponsoredCarousel"
import { resolveProductImageUrl, sanitizeImageUrl } from "@/lib/image-url"

function formatCategoryName(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

function formatPromo(price: number, comparePrice?: number | null, isFeatured?: boolean) {
  if (typeof comparePrice === "number" && comparePrice > price) {
    const discount = Math.round(((comparePrice - price) / comparePrice) * 100)
    return `Min. ${discount}% Off`
  }

  return isFeatured ? "Featured Drop" : "New Season"
}

async function getSponsoredItems() {
  const items: SandboxSponsoredItem[] = []
  const seenBrands = new Set<string>()
  const mockBrandById = new Map(mockBrands.map((brand) => [brand.id, brand]))

  try {
    const featuredProducts = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 24,
      select: {
        id: true,
        price: true,
        comparePrice: true,
        isFeatured: true,
        images: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    for (const product of featuredProducts) {
      if (!product.brand || !product.images[0] || seenBrands.has(product.brand.id)) {
        continue
      }

      seenBrands.add(product.brand.id)
      items.push({
        id: product.id,
        href: `/products?brand=${product.brand.slug}`,
        image: resolveProductImageUrl(product.images[0]),
        logo: product.brand.logo,
        brandName: product.brand.name,
        categoryName: product.category.name,
        promo: formatPromo(Number(product.price), product.comparePrice ? Number(product.comparePrice) : null, product.isFeatured),
        showStoreBadge: product.isFeatured,
      })

      if (items.length === 8) {
        return items
      }
    }
  } catch {
    // Fallback to mock data below when the database is unavailable.
  }

  for (const product of mockProducts) {
    const brand = mockBrandById.get(product.brandId)

    if (!brand || !product.images[0] || seenBrands.has(brand.id)) {
      continue
    }

    seenBrands.add(brand.id)
    items.push({
      id: product.id,
      href: `/products?brand=${brand.slug}`,
      image: sanitizeImageUrl(product.images[0]),
      logo: brand.logo,
      brandName: brand.name,
      categoryName: formatCategoryName(product.category),
      promo: formatPromo(product.price, product.originalPrice, product.isFeatured),
      showStoreBadge: product.isFeatured,
    })

    if (items.length === 8) {
      break
    }
  }

  return items
}

export async function SandboxBrandSection() {
  const items = await getSponsoredItems()

  return (
    <section className="border-t bg-background py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Las mejores marcas para ti
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Nike, Adidas, Converse, Puma y más en un solo lugar
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground">Próximamente nuevas marcas</p>
        ) : (
          <SandboxSponsoredCarousel items={items} />
        )}
      </div>
    </section>
  )
}
