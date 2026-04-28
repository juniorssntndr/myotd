"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  productName: string
}

const SWIPE_THRESHOLD_PX = 50

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback(
    (index: number) => {
      const safeIndex = ((index % images.length) + images.length) % images.length
      setSelectedIndex(safeIndex)
    },
    [images.length]
  )

  const goToPrevious = useCallback(() => {
    setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setSelectedIndex((current) => (current === images.length - 1 ? 0 : current + 1))
  }, [images.length])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    touchStartX.current = e.clientX
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (touchStartX.current === null) return
      const delta = e.clientX - touchStartX.current
      touchStartX.current = null
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
      if (delta > 0) {
        goToPrevious()
      } else {
        goToNext()
      }
    },
    [goToNext, goToPrevious]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-muted select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <Image
          src={images[selectedIndex]}
          alt={productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {images.length > 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full sm:flex"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full sm:flex"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Mobile: dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 sm:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                i === selectedIndex ? "bg-primary w-4" : "bg-muted-foreground/40"
              )}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails — desktop only */}
      {images.length > 1 && (
        <div className="hidden gap-2 overflow-x-auto pb-2 sm:flex">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <Image
                src={image}
                alt={`${productName} - ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
