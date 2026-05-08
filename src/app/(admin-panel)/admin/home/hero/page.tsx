"use client"

import { useEffect, useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { HeroSlideForm } from "@/components/admin/HeroSlideForm"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  defaultHomeVisual,
  homeHeroFormSchema,
  homeHeroVisualSchema,
  type HomeHeroVisual,
} from "@/lib/home-visual"
import { fetchHomeVisualFromApi, persistHomeVisualToApi } from "@/lib/home-visual-persist"
import { validateImageUrl } from "@/lib/image-url"

type HeroFormValues = z.infer<typeof homeHeroFormSchema>

export default function AdminHomeHeroPage() {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(homeHeroFormSchema) as any,
    defaultValues: defaultHomeVisual.hero as any,
  })

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const full = await fetchHomeVisualFromApi()
        if (!cancelled) {
          form.reset(full.hero)
        }
      } catch {
        toast.error("No se pudo cargar la configuración del hero")
      } finally {
        if (!cancelled) {
          setPageLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [form])

  const onSubmit = async (hero: HeroFormValues) => {
    for (let i = 0; i < hero.slides.length; i++) {
      const img = hero.slides[i].image?.trim()
      if (img) {
        const result = validateImageUrl(img)
        if (!result.valid) {
          toast.error(`Slide ${i + 1}: ${result.error}`)
          return
        }
      }
    }

    setSaving(true)
    try {
      const normalizedHero = homeHeroVisualSchema.parse(hero) as HomeHeroVisual
      const savedHomeVisual = await persistHomeVisualToApi({ hero: normalizedHero })
      form.reset(savedHomeVisual.hero)
      router.refresh()
      toast.success("Hero guardado correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el hero")
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/home" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Home visual
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Hero — imágenes y textos</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Tres slides, presets visuales semánticos y controles globales de contraste. Eso desacopla la
        configuración de clases Tailwind crudas y vuelve más estable el editor.
      </p>
      <HomeVisualImageInstructions />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {[0, 1, 2].map((index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Slide {index + 1}</CardTitle>
                <CardDescription>Texto, enlace, imagen y colores de fondo</CardDescription>
              </CardHeader>
              <CardContent>
                <HeroSlideForm form={form} index={index} />
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Capas globales</CardTitle>
              <CardDescription>Opacidad de imagen, tinte y sombras</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="imageOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Opacidad imagen de fondo ({field.value}%)</Label>
                    <FormControl>
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        value={field.value ?? 0}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tintOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Intensidad tinte ({field.value}%)</Label>
                    <FormControl>
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        value={field.value ?? 0}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sideShadeOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Sombra lateral ({field.value}%)</Label>
                    <FormControl>
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        value={field.value ?? 0}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="radialHighlightOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Highlight radial ({field.value}%)</Label>
                    <FormControl>
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        value={field.value ?? 0}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="radialShadowOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Sombra radial ({field.value}%)</Label>
                    <FormControl>
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        value={field.value ?? 0}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/">Ver tienda</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar hero
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}