"use client"

import { useMemo, useState } from "react"
import { ShoppingCart, Star, Minus, Plus, Truck, Award, ShieldCheck, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Product } from "@/types"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"
import { ProductFavoriteButton } from "@/components/products/ProductFavoriteButton"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || "")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const addItem = useCartStore((state) => state.addItem)

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null
    return product.variants.find((v) => v.color === selectedColor && v.size === selectedSize) || null
  }, [product.variants, selectedColor, selectedSize])

  const totalStock = useMemo(() => {
    return product.variants.reduce((sum, v) => sum + v.stock, 0)
  }, [product.variants])

  const isOutOfStock = totalStock === 0
  const effectiveQuantity = selectedVariant
    ? Math.min(quantity, Math.max(1, selectedVariant.stock))
    : 1
  const canAddToCart = Boolean(
    selectedVariant && selectedVariant.stock > 0 && effectiveQuantity <= selectedVariant.stock
  )

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (selectedVariant && effectiveQuantity < selectedVariant.stock) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addItem(product, selectedVariant.id, effectiveQuantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setSelectedSize("")
    setQuantity(1)
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    setQuantity(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {product.isNew && (
          <Badge className="bg-primary text-primary-foreground">Nuevo</Badge>
        )}
        {hasDiscount && <Badge variant="destructive">-{discountPercent}%</Badge>}
      </div>

      <p className="text-sm text-muted-foreground">{product.brand}</p>

      <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{product.rating}</span>
        <span className="text-sm text-muted-foreground">(128 resenas)</span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-primary">
          S/ {product.price.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-muted-foreground line-through">
            S/ {product.originalPrice!.toFixed(2)}
          </span>
        )}
      </div>

      <Separator />

      {isOutOfStock ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="font-medium text-destructive">Producto agotado</p>
          <p className="text-sm text-muted-foreground">No hay stock disponible para este producto</p>
        </div>
      ) : (
        <>
          <div>
            <h3 className="mb-3 font-medium">Color</h3>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => {
                const hasStock = product.variants.some((v) => v.color === color && v.stock > 0)
                return (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    disabled={!hasStock}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      selectedColor === color
                        ? "border-primary bg-primary text-primary-foreground"
                        : hasStock
                        ? "border-muted-foreground/30 hover:border-muted-foreground"
                        : "border-muted-foreground/20 bg-muted/50 text-muted-foreground line-through"
                    )}
                  >
                    {color}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedColor && (
            <div>
              <h3 className="mb-3 font-medium">Talla</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const variant = product.variants.find((v) => v.color === selectedColor && v.size === size)
                  const hasStock = variant && variant.stock > 0
                  const isSelected = selectedSize === size

                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      disabled={!hasStock}
                      className={cn(
                        "min-w-[48px] rounded-full border px-4 py-2 text-sm transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : hasStock
                          ? "border-muted-foreground/30 hover:border-muted-foreground"
                          : "border-muted-foreground/20 bg-muted/50 text-muted-foreground line-through"
                      )}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedVariant && (
            <p className="text-sm">
              {selectedVariant.stock <= 5 ? (
                <span className="text-orange-600 dark:text-orange-400">
                  Solo quedan {selectedVariant.stock} unidades
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400">
                  {selectedVariant.stock} unidades disponibles
                </span>
              )}
            </p>
          )}
        </>
      )}

      <Separator />

      <div>
        <h3 className="font-semibold mb-2">Descripción</h3>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </div>

      <Separator />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Cantidad:</span>
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={decreaseQuantity}
              disabled={quantity <= 1 || !selectedVariant}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-sm font-medium">{effectiveQuantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={increaseQuantity}
              disabled={!selectedVariant || effectiveQuantity >= selectedVariant.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-2">
          <Button
            className="flex-1"
            size="lg"
            disabled={!canAddToCart || added}
            onClick={handleAddToCart}
          >
            {!selectedSize ? (
              "Selecciona talla"
            ) : added ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al Carrito
              </>
            )}
          </Button>
          <ProductFavoriteButton
            product={product}
            variant="outline"
            size="lg"
            showLabel
            className="shrink-0 gap-2"
          />
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 text-sm">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Envío gratis</p>
            <p className="text-xs text-muted-foreground">En pedidos +S/ 200</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Award className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Las Mejores Marcas</p>
            <p className="text-xs text-muted-foreground">Exclusivas y reconocidas</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Garantía</p>
            <p className="text-xs text-muted-foreground">1 ano de garantia</p>
          </div>
        </div>
      </div>
    </div>
  )
}
