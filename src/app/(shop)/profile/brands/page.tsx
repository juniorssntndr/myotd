"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Award, ShoppingBag } from "lucide-react"
import { BrandFavoriteButton } from "@/components/products/BrandFavoriteButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useFavoriteBrandsStore } from "@/stores/favorite-brands-store"

function FavoriteBrandsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
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

export default function BrandsPage() {
  const { favoriteBrands, initialized, fetchFavoriteBrands } = useFavoriteBrandsStore()

  useEffect(() => {
    void fetchFavoriteBrands()
  }, [fetchFavoriteBrands])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Mis Marcas</h2>
        <p className="text-muted-foreground">Las marcas que decidiste guardar manualmente</p>
      </div>

      {!initialized ? (
        <FavoriteBrandsSkeleton />
      ) : favoriteBrands.length === 0 ? (
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Award className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">No tienes marcas favoritas</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Explora el listado real de marcas y guarda las que más te gusten.
            </p>
            <Button asChild>
              <Link href="/brands">Explorar Marcas</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {favoriteBrands.length} {favoriteBrands.length === 1 ? "marca guardada" : "marcas guardadas"}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {favoriteBrands.map((brand) => (
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
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/brands" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Explorar más marcas
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
