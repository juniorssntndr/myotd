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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  OFFER_TONE_KEYS,
  OFFER_TONE_LABELS,
  type HomeFeaturedOfferCard,
  type OfferToneKey,
} from "@/lib/home-featured-offers.shared"
import {
  defaultHomeVisual,
  type HomeCategoryOfferOverride,
  type HomeFeaturedOffersVisual,
} from "@/lib/home-visual"
import { fetchHomeVisualFromApi, persistHomeVisualToApi } from "@/lib/home-visual-persist"
import { validateImageUrl } from "@/lib/image-url"

const featuredHeaderFormSchema = z.object({
  eyebrow: z.string().min(1).max(80),
  title: z.string().min(1).max(80),
  ctaLabel: z.string().min(1).max(32),
  toneOpacity: z.number().min(0).max(100),
  darkFromOpacity: z.number().min(0).max(100),
  darkViaOpacity: z.number().min(0).max(100),
  darkToOpacity: z.number().min(0).max(100),
  radialDarkOpacity: z.number().min(0).max(100),
})

type FeaturedHeaderForm = z.infer<typeof featuredHeaderFormSchema>

function cleanCategoryOverrides(
  record: Record<string, { imageUrl?: string; toneKey?: string }>
): HomeFeaturedOffersVisual["categoryOverrides"] {
  const next: HomeFeaturedOffersVisual["categoryOverrides"] = {}

  for (const [slug, entry] of Object.entries(record)) {
    const imageUrl = entry.imageUrl?.trim()
    const toneKey = entry.toneKey?.trim() as OfferToneKey | ""

    if (!imageUrl && !toneKey) {
      continue
    }

    const row: HomeCategoryOfferOverride = {}
    if (imageUrl) {
      row.imageUrl = imageUrl
    }
    if (toneKey && OFFER_TONE_KEYS.includes(toneKey as OfferToneKey)) {
      row.toneKey = toneKey as OfferToneKey
    }

    if (Object.keys(row).length > 0) {
      next[slug] = row
    }
  }

  return next
}

export default function AdminHomeFeaturedOffersPage() {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [offers, setOffers] = useState<HomeFeaturedOfferCard[]>([])
  const [overrides, setOverrides] = useState<
    Record<string, { imageUrl?: string; toneKey?: string }>
  >({})

  const form = useForm<FeaturedHeaderForm>({
    resolver: zodResolver(featuredHeaderFormSchema),
    defaultValues: {
      eyebrow: defaultHomeVisual.featuredOffers.eyebrow,
      title: defaultHomeVisual.featuredOffers.title,
      ctaLabel: defaultHomeVisual.featuredOffers.ctaLabel,
      toneOpacity: defaultHomeVisual.featuredOffers.toneOpacity,
      darkFromOpacity: defaultHomeVisual.featuredOffers.darkFromOpacity,
      darkViaOpacity: defaultHomeVisual.featuredOffers.darkViaOpacity,
      darkToOpacity: defaultHomeVisual.featuredOffers.darkToOpacity,
      radialDarkOpacity: defaultHomeVisual.featuredOffers.radialDarkOpacity,
    },
  })

  const load = useCallback(async () => {
    setPageLoading(true)
    try {
      const [visualFull, offersRes] = await Promise.all([
        fetchHomeVisualFromApi(),
        fetch("/api/admin/home-visual/featured-offers-preview"),
      ])

      if (!offersRes.ok) {
        throw new Error("offers")
      }

      const { offers: offerList } = (await offersRes.json()) as { offers: HomeFeaturedOfferCard[] }
      setOffers(offerList)

      const mapped: Record<string, { imageUrl?: string; toneKey?: string }> = {}
      for (const [slug, value] of Object.entries(visualFull.featuredOffers.categoryOverrides)) {
        mapped[slug] = {
          imageUrl: value.imageUrl ?? "",
          toneKey: value.toneKey ?? "",
        }
      }
      setOverrides(mapped)

      form.reset({
        eyebrow: visualFull.featuredOffers.eyebrow,
        title: visualFull.featuredOffers.title,
        ctaLabel: visualFull.featuredOffers.ctaLabel,
        toneOpacity: visualFull.featuredOffers.toneOpacity,
        darkFromOpacity: visualFull.featuredOffers.darkFromOpacity,
        darkViaOpacity: visualFull.featuredOffers.darkViaOpacity,
        darkToOpacity: visualFull.featuredOffers.darkToOpacity,
        radialDarkOpacity: visualFull.featuredOffers.radialDarkOpacity,
      })
    } catch {
      toast.error("No se pudo cargar ofertas o configuración")
    } finally {
      setPageLoading(false)
    }
  }, [form])

  useEffect(() => {
    void load()
  }, [load])

  const updateOverride = (slug: string, field: "imageUrl" | "toneKey", value: string) => {
    setOverrides((previous) => ({
      ...previous,
      [slug]: {
        ...previous[slug],
        [field]: value,
      },
    }))
  }

  const onSubmit = async (values: FeaturedHeaderForm) => {
    for (const [slug, entry] of Object.entries(overrides)) {
      const img = entry.imageUrl?.trim()
      if (img) {
        const result = validateImageUrl(img)
        if (!result.valid) {
          toast.error(`Categoría ${slug} (imagen): ${result.error}`)
          return
        }
      }
    }

    setSaving(true)
    try {
      const featuredPayload: HomeFeaturedOffersVisual = {
        ...values,
        categoryOverrides: cleanCategoryOverrides(overrides),
      }
      const savedHomeVisual = await persistHomeVisualToApi({ featuredOffers: featuredPayload })
      form.reset(savedHomeVisual.featuredOffers)
      const mapped: Record<string, { imageUrl?: string; toneKey?: string }> = {}
      for (const [slug, value] of Object.entries(savedHomeVisual.featuredOffers.categoryOverrides)) {
        mapped[slug] = {
          imageUrl: value.imageUrl ?? "",
          toneKey: value.toneKey ?? "",
        }
      }
      setOverrides(mapped)
      router.refresh()
      toast.success("Ofertas destacadas guardadas correctamente")
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
        <h1 className="text-2xl font-semibold tracking-tight">Ofertas destacadas</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Los textos de descuento y enlaces salen del catálogo (productos con precio tachado). La imagen
        por categoría es la del producto con mayor descuento; aquí puedes sustituir imagen y paleta de
        degradado por categoría (slug).
      </p>
      <HomeVisualImageInstructions />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Encabezado</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="eyebrow"
                render={({ field }) => (
                  <FormItem>
                    <Label>Eyebrow</Label>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
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
                name="ctaLabel"
                render={({ field }) => (
                  <FormItem>
                    <Label>Texto enlace &quot;ver todo&quot;</Label>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intensidad de capas (todas las tarjetas)</CardTitle>
              <CardDescription>Sliders globales del carrusel de ofertas</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="toneOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Tono color ({field.value}%)</Label>
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
                name="darkFromOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Gradiente oscuro — base ({field.value}%)</Label>
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
                name="darkViaOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Gradiente oscuro — medio ({field.value}%)</Label>
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
                name="darkToOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Gradiente oscuro — arriba ({field.value}%)</Label>
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
                name="radialDarkOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Radial inferior ({field.value}%)</Label>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Por categoría (slug)</CardTitle>
              <CardDescription>Solo filas que existen hoy en el home</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {offers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay ofertas agrupadas aún (necesitas productos con precio comparativo mayor al
                  precio).
                </p>
              ) : (
                offers.map((offer) => {
                  const row = overrides[offer.id] ?? { imageUrl: "", toneKey: "" }

                  return (
                    <div
                      key={offer.id}
                      className="grid gap-4 border-b border-border/60 pb-8 last:border-0 last:pb-0 lg:grid-cols-[120px_1fr_1fr_160px]"
                    >
                      <div className="relative aspect-square w-full max-w-[120px] overflow-hidden rounded-lg bg-muted">
                        {/* Preview URLs may be arbitrary admin input; avoid next/image remotePatterns friction */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={offer.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium leading-tight">{offer.title}</p>
                        <p className="text-xs text-muted-foreground">slug: {offer.id}</p>
                        <p className="text-xs text-muted-foreground">{offer.discount}</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Imagen URL (opcional)</Label>
                        <Input
                          placeholder="Usar imagen del catálogo"
                          value={row.imageUrl ?? ""}
                          onChange={(event) =>
                            updateOverride(offer.id, "imageUrl", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Degradado color</Label>
                        <Select
                          value={row.toneKey && row.toneKey.length > 0 ? row.toneKey : "__auto__"}
                          onValueChange={(value) =>
                            updateOverride(
                              offer.id,
                              "toneKey",
                              value === "__auto__" ? "" : value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Automático" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__auto__">Automático (rotación)</SelectItem>
                            {OFFER_TONE_KEYS.map((key) => (
                              <SelectItem key={key} value={key}>
                                {OFFER_TONE_LABELS[key]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => void load()}>
              Recargar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar ofertas
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}