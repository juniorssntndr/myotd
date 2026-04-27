"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Building2 } from "lucide-react"
import { BrandFavoriteButton } from "@/components/products/BrandFavoriteButton"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBrandsStore } from "@/stores/brands-store"
import { useFavoriteBrandsStore } from "@/stores/favorite-brands-store"

function BrandsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Card key={item} className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="space-y-2 text-center">
              <Skeleton className="mx-auto h-4 w-24" />
              <Skeleton className="mx-auto h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function BrandsCatalogPage() {
  const { brands, loading, fetchBrands } = useBrandsStore()
  const { fetchFavoriteBrands } = useFavoriteBrandsStore()

  useEffect(() => {
    void fetchBrands()
    void fetchFavoriteBrands()
  }, [fetchBrands, fetchFavoriteBrands])

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">Marcas</p>
        <h1 className="text-3xl font-semibold tracking-tight">Explorá tus marcas favoritas</h1>
        <p className="max-w-2xl text-muted-foreground">
          Guardá marcas para encontrarlas rápido desde tu cuenta y navegar directo a sus productos.
        </p>
      </div>

      {loading && brands.length === 0 ? (
        <BrandsSkeleton />
      ) : brands.length === 0 ? (
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">Todavía no hay marcas cargadas</h2>
              <p className="text-sm text-muted-foreground">Cuando existan marcas activas aparecerán aquí.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/products?brand=${brand.slug}`} className="block">
              <Card className="group h-full overflow-hidden border-border/60 bg-card/95 transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="relative aspect-[3/1] flex-1 overflow-hidden rounded-md bg-muted">
                      {brand.logo ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          unoptimized
                          className="object-contain p-2 transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-muted-foreground">
                          {brand.name}
                        </div>
                      )}
                    </div>
                    <BrandFavoriteButton brand={brand} variant="outline" size="icon" className="shrink-0" />
                  </div>

                  <div className="text-center">
                    <p className="font-medium">{brand.name}</p>
                    <p className="text-xs text-muted-foreground">{brand.productCount} productos</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
