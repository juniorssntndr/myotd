"use client"

import type { MouseEvent } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFavoritesStore } from "@/stores/favorites-store"
import type { Product } from "@/types"

interface ProductFavoriteButtonProps {
  product: Product
  className?: string
  iconClassName?: string
  size?: "default" | "icon" | "sm" | "lg"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  showLabel?: boolean
}

export function ProductFavoriteButton({
  product,
  className,
  iconClassName,
  size = "icon",
  variant = "ghost",
  showLabel = false,
}: ProductFavoriteButtonProps) {
  const hydrated = useFavoritesStore((state) => state.hydrated)
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id))
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite(product)
  }

  const label = isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleClick}
      aria-pressed={hydrated && isFavorite}
      aria-label={label}
      data-state={hydrated && isFavorite ? "on" : "off"}
      disabled={!hydrated}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          hydrated && isFavorite && "fill-rose-500 text-rose-500",
          iconClassName
        )}
      />
      {showLabel && <span>{hydrated && isFavorite ? "Guardado" : "Favorito"}</span>}
      <span className="sr-only">{label}</span>
    </Button>
  )
}
