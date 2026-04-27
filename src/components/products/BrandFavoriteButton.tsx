"use client"

import type { MouseEvent } from "react"
import { Heart } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFavoriteBrandsStore } from "@/stores/favorite-brands-store"
import type { Brand } from "@/types"

interface BrandFavoriteButtonProps {
  brand: Brand
  className?: string
  iconClassName?: string
  size?: "default" | "icon" | "sm" | "lg"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  showLabel?: boolean
}

export function BrandFavoriteButton({
  brand,
  className,
  iconClassName,
  size = "icon",
  variant = "ghost",
  showLabel = false,
}: BrandFavoriteButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useSession()
  const initialized = useFavoriteBrandsStore((state) => state.initialized)
  const isFavorite = useFavoriteBrandsStore((state) => state.isFavoriteBrand(brand.id))
  const toggleFavoriteBrand = useFavoriteBrandsStore((state) => state.toggleFavoriteBrand)

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/brands")}`)
      return
    }

    try {
      await toggleFavoriteBrand(brand)
    } catch (error) {
      if ((error as Error).message === "AUTH_REQUIRED") {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/brands")}`)
      }
    }
  }

  const label = isFavorite ? "Quitar marca favorita" : "Guardar marca favorita"

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={(event) => { void handleClick(event) }}
      aria-pressed={initialized && isFavorite}
      aria-label={label}
      data-state={initialized && isFavorite ? "on" : "off"}
      disabled={status === "loading"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          initialized && isFavorite && "fill-[var(--myotd-red)] text-[var(--myotd-red)]",
          iconClassName
        )}
      />
      {showLabel && <span>{initialized && isFavorite ? "Guardada" : "Guardar"}</span>}
      <span className="sr-only">{label}</span>
    </Button>
  )
}
