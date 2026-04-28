"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resolveProductImageUrl, validateImageUrl } from "@/lib/image-url"

type ProductImageManagerProps = {
  value: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ProductImageManager({
  value,
  onChange,
  maxImages = 5,
}: ProductImageManagerProps) {
  const [touched, setTouched] = useState<Record<number, boolean>>({})

  const addImage = () => {
    if (value.length >= maxImages) return
    onChange([...value, ""])
  }

  const updateImage = (index: number, nextValue: string) => {
    onChange(value.map((image, imageIndex) => (imageIndex === index ? nextValue : image)))
  }

  const removeImage = (index: number) => {
    const next = value.filter((_, imageIndex) => imageIndex !== index)
    onChange(next)
    setTouched((prev) => {
      const nextTouched = { ...prev }
      delete nextTouched[index]
      return nextTouched
    })
  }

  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= value.length) return
    const nextImages = [...value]
    ;[nextImages[index], nextImages[targetIndex]] = [nextImages[targetIndex], nextImages[index]]
    onChange(nextImages)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
        <p>
          Pegá la <strong>URL completa</strong> del asset o solo el <strong>path Imgix</strong>
          (ej. <code>nikeshoes/foto.jpg</code>). La primera imagen se usa como portada del producto.
        </p>
      </div>

      <div className="space-y-4">
        {value.map((image, index) => {
          const resolvedImage = resolveProductImageUrl(image)
          const fieldError =
            touched[index] && image.trim() !== "" ? validateImageUrl(image) : null
          const hasError = fieldError && !fieldError.valid

          return (
            <div
              key={`product-image-${index}`}
              className={`grid gap-4 rounded-xl border p-4 lg:grid-cols-[140px_1fr_auto] ${
                hasError ? "border-destructive/60 bg-destructive/5" : "border-border/60"
              }`}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {resolvedImage ? (
                  <Image
                    src={resolvedImage}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="140px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                )}

                {index === 0 ? (
                  <span className="absolute bottom-2 left-2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Principal
                  </span>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Imagen {index + 1}</Label>
                <Input
                  placeholder="https://... o path Imgix"
                  value={image}
                  onChange={(event) => updateImage(index, event.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, [index]: true }))}
                />
                {hasError ? (
                  <p className="text-xs text-destructive">{fieldError.error}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Si usás Imgix, podés pegar la URL completa del Asset Manager o solo el path.
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 lg:flex-col lg:items-stretch">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => moveImage(index, "left")}
                  disabled={index === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => moveImage(index, "right")}
                  disabled={index === value.length - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => removeImage(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {value.length < maxImages ? (
        <Button type="button" variant="outline" onClick={addImage}>
          <ImagePlus className="mr-2 h-4 w-4" />
          Agregar imagen
        </Button>
      ) : null}
    </div>
  )
}
