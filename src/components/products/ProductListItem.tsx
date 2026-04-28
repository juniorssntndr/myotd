"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Product } from "@/types"
import { useCartStore } from "@/stores/cart-store"
import { ProductFavoriteButton } from "@/components/products/ProductFavoriteButton"

interface ProductListItemProps {
  product: Product
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=400&h=400&fit=crop"

export function ProductListItem({ product }: ProductListItemProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const productImage = product.images?.[0] || PLACEHOLDER_IMAGE
  const secondaryImage = product.images?.[1] || null

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  const isOutOfStock = totalStock === 0

  const firstAvailableVariant = product.variants.find((v) => v.stock > 0)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (firstAvailableVariant) {
      addItem(product, firstAvailableVariant.id)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  return (
    <Card className="group flex flex-col sm:flex-row p-4 sm:p-5 gap-4 sm:gap-6 overflow-hidden transition-all hover:shadow-lg">
      {/* Contenedor de la imagen: tamaño fijo, cuadrado y sin estirarse (self-start o fixed height) */}
      <div className="relative aspect-square sm:h-48 sm:w-48 sm:shrink-0 bg-muted/30 rounded-lg overflow-hidden">
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground">Nuevo</Badge>
          )}
          {hasDiscount && (
            <Badge variant="destructive">-{discountPercent}%</Badge>
          )}
        </div>

        <ProductFavoriteButton
          product={product}
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-background/80 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 data-[state=on]:opacity-100"
        />

        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <div className="relative h-full w-full">
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 200px"
            />
            {secondaryImage ? (
              <Image
                src={secondaryImage}
                alt={`${product.name} imagen secundaria`}
                fill
                className="object-cover opacity-0 transition-opacity duration-300 md:group-hover:opacity-100"
                sizes="(max-width: 640px) 100vw, 200px"
              />
            ) : null}
          </div>
        </Link>

        {product.images.length > 1 ? (
          <span className="absolute bottom-2 left-2 z-10 rounded-full bg-background/85 px-2 py-1 text-[11px] font-medium text-foreground">
            {product.images.length} fotos
          </span>
        ) : null}
      </div>

      <CardContent className="flex flex-1 flex-col p-0 justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground">{product.brand}</p>
              <Link href={`/products/${product.slug}`}>
                <h3 className="mt-1 text-lg font-medium leading-tight hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
            </div>
            {product.images.length > 1 ? (
              <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                Hover para ver más
              </div>
            ) : null}
          </div>

          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                S/ {product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  S/ {product.originalPrice!.toFixed(2)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isOutOfStock ? (
                <span className="text-destructive">Agotado</span>
              ) : (
                <span className="text-green-600 dark:text-green-400">
                  {totalStock} disponibles
                </span>
              )}
            </p>
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            variant={added ? "secondary" : "default"}
          >
            {added ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al carrito
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
