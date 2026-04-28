"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HomeVisualImageInstructions } from "@/components/admin/HomeVisualImageInstructions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import type { Brand } from "@/types"
import {
  type HomeBrandOverrideEntry,
  defaultHomeVisual,
  type HomeBrandsVisual,
} from "@/lib/home-visual"
import { fetchHomeVisualFromApi, persistHomeVisualToApi } from "@/lib/home-visual-persist"
import { validateImageUrl } from "@/lib/image-url"

const brandsHeaderFormSchema = z.object({
  title: z.string().min(1).max(80),
  subtitle: z.string().min(1).max(180),
  imageOverlayOpacity: z.number().min(0).max(100),
  showStoreBadge: z.boolean(),
})

type BrandsForm = z.infer<typeof brandsHeaderFormSchema>

function cleanBrandOverrides(
  record: Record<string, HomeBrandOverrideEntry>
): Record<string, HomeBrandOverrideEntry> {
  const next: Record<string, HomeBrandOverrideEntry> = {}

  for (const [slug, entry] of Object.entries(record)) {
    const displayName = entry.displayName?.trim()
    const heroImage = entry.heroImage?.trim()
    const logoUrl = entry.logoUrl?.trim()

    if (!displayName && !heroImage && !logoUrl) {
      continue
    }

    next[slug] = {
      ...(displayName ? { displayName } : {}),
      ...(heroImage ? { heroImage } : {}),
      ...(logoUrl ? { logoUrl } : {}),
    }
  }

  return next
}

export default function AdminHomeBrandsPage() {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [overrides, setOverrides] = useState<Record<string, HomeBrandOverrideEntry>>({})

  const form = useForm<BrandsForm>({
    resolver: zodResolver(brandsHeaderFormSchema),
    defaultValues: {
      title: defaultHomeVisual.brands.title,
      subtitle: defaultHomeVisual.brands.subtitle,
      imageOverlayOpacity: defaultHomeVisual.brands.imageOverlayOpacity,
      showStoreBadge: defaultHomeVisual.brands.showStoreBadge,
    },
  })

  const load = useCallback(async () => {
    setPageLoading(true)
    try {
      const [visualFull, brandsRes] = await Promise.all([
        fetchHomeVisualFromApi(),
        fetch("/api/brands"),
      ])

      if (!brandsRes.ok) {
        throw new Error("brands")
      }

      const brandList = (await brandsRes.json()) as Brand[]
      setBrands(brandList)
      setOverrides({ ...visualFull.brands.brandOverrides })
      form.reset({
        title: visualFull.brands.title,
        subtitle: visualFull.brands.subtitle,
        imageOverlayOpacity: visualFull.brands.imageOverlayOpacity,
        showStoreBadge: visualFull.brands.showStoreBadge,
      })
    } catch {
      toast.error("No se pudo cargar marcas o configuración")
    } finally {
      setPageLoading(false)
    }
  }, [form])

  useEffect(() => {
    void load()
  }, [load])

  const updateOverride = (slug: string, field: keyof HomeBrandOverrideEntry, value: string) => {
    setOverrides((previous) => ({
      ...previous,
      [slug]: {
        ...previous[slug],
        [field]: value,
      },
    }))
  }

  const onSubmit = async (values: BrandsForm) => {
    for (const [slug, entry] of Object.entries(overrides)) {
      const heroImg = entry.heroImage?.trim()
      if (heroImg) {
        const result = validateImageUrl(heroImg)
        if (!result.valid) {
          toast.error(`Marca ${slug} (heroImage): ${result.error}`)
          return
        }
      }
      const logoUrl = entry.logoUrl?.trim()
      if (logoUrl) {
        const result = validateImageUrl(logoUrl)
        if (!result.valid) {
          toast.error(`Marca ${slug} (logoUrl): ${result.error}`)
          return
        }
      }
    }

    setSaving(true)
    try {
      const brandsPayload: HomeBrandsVisual = {
        ...values,
        brandOverrides: cleanBrandOverrides(overrides),
      }
      const savedHomeVisual = await persistHomeVisualToApi({ brands: brandsPayload })
      form.reset(savedHomeVisual.brands)
      setOverrides({ ...savedHomeVisual.brands.brandOverrides })
      router.refresh()
      toast.success("Marcas guardadas correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/home" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Home visual
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Marcas — carrusel</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        El carrusel sigue armándose desde el catálogo (productos destacados). Aquí solo sobrescribes
        nombre visible, imagen de la tarjeta y logo por marca (slug). Deja vacío para usar el dato del
        catálogo.
      </p>
      <HomeVisualImageInstructions />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Encabezado de sección</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <Label>Título</Label>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <Label>Subtítulo</Label>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageOverlayOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Overlay sobre imagen ({field.value}%)</Label>
                    <FormControl>
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="showStoreBadge"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label>Badge &quot;In Store&quot;</Label>
                      <p className="text-xs text-muted-foreground">Solo si el producto es featured</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overrides por marca</CardTitle>
              <CardDescription>Clave interna: slug ({brands.length} marcas)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {brands.map((brand) => {
                const row = overrides[brand.slug] ?? {}

                return (
                  <div
                    key={brand.id}
                    className="grid gap-3 border-b border-border/60 pb-6 last:border-0 last:pb-0 sm:grid-cols-[140px_1fr]"
                  >
                    <div>
                      <p className="font-medium">{brand.name}</p>
                      <p className="text-xs text-muted-foreground">{brand.slug}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nombre en carrusel</Label>
                        <Input
                          placeholder="(catálogo)"
                          value={row.displayName ?? ""}
                          onChange={(event) =>
                            updateOverride(brand.slug, "displayName", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Imagen de fondo URL</Label>
                        <Input
                          placeholder="(producto)"
                          value={row.heroImage ?? ""}
                          onChange={(event) =>
                            updateOverride(brand.slug, "heroImage", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Logo URL</Label>
                        <Input
                          placeholder="(marca)"
                          value={row.logoUrl ?? ""}
                          onChange={(event) =>
                            updateOverride(brand.slug, "logoUrl", event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => void load()}>
              Recargar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar marcas
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}