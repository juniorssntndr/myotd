"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

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
  const [uploading, setUploading] = useState(false)

  const addImage = () => {
    if (value.length >= maxImages) return
    onChange([...value, ""])
  }

  const updateImage = (index: number, nextValue: string) => {
    onChange(value.map((image, imageIndex) => (imageIndex === index ? nextValue : image)))
  }

  const removeImage = (index: number) => {
    const image = value[index]
    const next = value.filter((_, imageIndex) => imageIndex !== index)
    onChange(next)
    if (image?.startsWith("/uploads/products/")) {
      fetch(`/api/uploads?path=${encodeURIComponent(image)}`, { method: "DELETE" }).catch(() => {
        toast.error("No se pudo eliminar el archivo local")
      })
    }
    setTouched((prev) => {
      const nextTouched = { ...prev }
      delete nextTouched[index]
      return nextTouched
    })
  }

  const uploadFiles = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).slice(0, Math.max(0, maxImages - value.length))
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      const uploadedPaths: string[] = []

      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "No se pudo subir la imagen")
        }

        const data = await response.json()
        uploadedPaths.push(data.path)
      }

      onChange([...value.filter((image) => image.trim().length > 0), ...uploadedPaths].slice(0, maxImages))
      toast.success(selectedFiles.length === 1 ? "Imagen subida" : "Imágenes subidas")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir la imagen")
    } finally {
      setUploading(false)
    }
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
      <div
        className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          uploadFiles(event.dataTransfer.files)
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Subí imágenes JPG, PNG o WebP de hasta 5MB. Se optimizan automáticamente al subirlas.
            También podés conservar URLs existentes o paths Imgix.
          </p>
          <Button type="button" variant="outline" disabled={uploading || value.length >= maxImages} asChild>
            <Label className="cursor-pointer">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Subir imagen
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) uploadFiles(event.target.files)
                  event.target.value = ""
                }}
              />
            </Label>
          </Button>
        </div>
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
