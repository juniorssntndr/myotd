import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export async function BrandSection() {
  const brands = await prisma.brand.findMany({
    where: {
      slug: {
        not: "converse",
      },
    },
    take: 8,
    orderBy: { name: "asc" },
  })

  const marqueeBrands = [...brands, ...brands]

  return (
    <section className="overflow-hidden border-t py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Marcas que Amamos</h2>
          <p className="mt-2 text-muted-foreground">
            Las mejores marcas de moda urbana en un solo lugar
          </p>
          <div className="mt-4">
            <Link href="/brands" className="text-sm font-medium text-[var(--myotd-red)] hover:underline">
              Ver todas las marcas
            </Link>
          </div>
        </div>

        {brands.length === 0 ? (
          <p className="text-center text-muted-foreground">Próximamente nuevas marcas</p>
        ) : (
          <div className="group relative overflow-hidden rounded-[28px] border border-border/60 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95)_0%,_rgba(245,247,250,0.92)_42%,_rgba(238,244,255,0.88)_100%)] px-2 py-8 sm:px-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background via-background/80 to-transparent" />

            <div className="brand-marquee-track group-hover:[animation-play-state:paused]">
              {marqueeBrands.map((brand, index) => (
                <Link
                  key={`${brand.id}-${index}`}
                  href={`/products?brand=${brand.slug}`}
                  className="brand-marquee-item"
                >
                  <div className="flex h-14 w-[180px] items-center justify-center sm:h-16 sm:w-[220px]">
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={180}
                        height={64}
                        unoptimized
                        className="brand-marquee-logo h-auto max-h-10 w-auto max-w-[150px] object-contain sm:max-h-12 sm:max-w-[180px]"
                      />
                    ) : (
                      <span className="brand-marquee-fallback text-xl font-semibold tracking-[0.08em] text-foreground/80">
                        {brand.name}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
