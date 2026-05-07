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
import { ColorPickerCustom } from "@/components/admin/ColorPickerCustom"
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
  HERO_GRADIENT_OPTIONS,
  HERO_TINT_OPTIONS,
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
    resolver: zodResolver(homeHeroFormSchema),
    defaultValues: defaultHomeVisual.hero,
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
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`slides.${index}.badge`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>Badge</Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personalización Visual Avanzada */}
                <div className="sm:col-span-2 space-y-6 pt-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Personalización Visual Avanzada
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Typography */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.typography.titleFont`}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs">Fuente del Título</Label>
                            <Select onValueChange={field.onChange} value={field.value || "font-sans"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="font-sans">Inter (Sans)</SelectItem>
                                <SelectItem value="font-serif">Playfair Display (Serif)</SelectItem>
                                <SelectItem value="font-display">Montserrat (Display)</SelectItem>
                                <SelectItem value="font-outfit">Outfit (Modern)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.titleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Título"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.subtitleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Subtítulo"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.customColors.useCustom`}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2 rounded-lg border bg-muted/20 p-3">
                            <input
                              type="checkbox"
                              id={`use-custom-${index}`}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`use-custom-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Usar colores HEX personalizados
                            </Label>
                          </div>
                        )}
                      />

                      {form.watch(`slides.${index}.customColors.useCustom`) && (
                        <div className="space-y-4 rounded-xl border bg-background/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Configuración de Degradado
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Inicio"
                                    color={field.value || "#000000"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Fin"
                                    color={field.value || "#1a1a1a"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`slides.${index}.customColors.gradient.via`}
                            render={({ field }) => (
                              <FormItem>
                                <ColorPickerCustom
                                  label="Punto medio (opcional)"
                                  color={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name={`slides.${index}.title`}
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

                {/* Personalización Visual Avanzada */}
                <div className="sm:col-span-2 space-y-6 pt-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Personalización Visual Avanzada
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Typography */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.typography.titleFont`}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs">Fuente del Título</Label>
                            <Select onValueChange={field.onChange} value={field.value || "font-sans"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="font-sans">Inter (Sans)</SelectItem>
                                <SelectItem value="font-serif">Playfair Display (Serif)</SelectItem>
                                <SelectItem value="font-display">Montserrat (Display)</SelectItem>
                                <SelectItem value="font-outfit">Outfit (Modern)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.titleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Título"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.subtitleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Subtítulo"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.customColors.useCustom`}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2 rounded-lg border bg-muted/20 p-3">
                            <input
                              type="checkbox"
                              id={`use-custom-${index}`}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`use-custom-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Usar colores HEX personalizados
                            </Label>
                          </div>
                        )}
                      />

                      {form.watch(`slides.${index}.customColors.useCustom`) && (
                        <div className="space-y-4 rounded-xl border bg-background/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Configuración de Degradado
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Inicio"
                                    color={field.value || "#000000"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Fin"
                                    color={field.value || "#1a1a1a"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`slides.${index}.customColors.gradient.via`}
                            render={({ field }) => (
                              <FormItem>
                                <ColorPickerCustom
                                  label="Punto medio (opcional)"
                                  color={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name={`slides.${index}.subtitle`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>Subtítulo</Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personalización Visual Avanzada */}
                <div className="sm:col-span-2 space-y-6 pt-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Personalización Visual Avanzada
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Typography */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.typography.titleFont`}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs">Fuente del Título</Label>
                            <Select onValueChange={field.onChange} value={field.value || "font-sans"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="font-sans">Inter (Sans)</SelectItem>
                                <SelectItem value="font-serif">Playfair Display (Serif)</SelectItem>
                                <SelectItem value="font-display">Montserrat (Display)</SelectItem>
                                <SelectItem value="font-outfit">Outfit (Modern)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.titleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Título"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.subtitleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Subtítulo"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.customColors.useCustom`}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2 rounded-lg border bg-muted/20 p-3">
                            <input
                              type="checkbox"
                              id={`use-custom-${index}`}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`use-custom-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Usar colores HEX personalizados
                            </Label>
                          </div>
                        )}
                      />

                      {form.watch(`slides.${index}.customColors.useCustom`) && (
                        <div className="space-y-4 rounded-xl border bg-background/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Configuración de Degradado
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Inicio"
                                    color={field.value || "#000000"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Fin"
                                    color={field.value || "#1a1a1a"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`slides.${index}.customColors.gradient.via`}
                            render={({ field }) => (
                              <FormItem>
                                <ColorPickerCustom
                                  label="Punto medio (opcional)"
                                  color={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name={`slides.${index}.cta`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>Texto botón</Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personalización Visual Avanzada */}
                <div className="sm:col-span-2 space-y-6 pt-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Personalización Visual Avanzada
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Typography */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.typography.titleFont`}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs">Fuente del Título</Label>
                            <Select onValueChange={field.onChange} value={field.value || "font-sans"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="font-sans">Inter (Sans)</SelectItem>
                                <SelectItem value="font-serif">Playfair Display (Serif)</SelectItem>
                                <SelectItem value="font-display">Montserrat (Display)</SelectItem>
                                <SelectItem value="font-outfit">Outfit (Modern)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.titleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Título"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.subtitleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Subtítulo"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.customColors.useCustom`}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2 rounded-lg border bg-muted/20 p-3">
                            <input
                              type="checkbox"
                              id={`use-custom-${index}`}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`use-custom-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Usar colores HEX personalizados
                            </Label>
                          </div>
                        )}
                      />

                      {form.watch(`slides.${index}.customColors.useCustom`) && (
                        <div className="space-y-4 rounded-xl border bg-background/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Configuración de Degradado
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Inicio"
                                    color={field.value || "#000000"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Fin"
                                    color={field.value || "#1a1a1a"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`slides.${index}.customColors.gradient.via`}
                            render={({ field }) => (
                              <FormItem>
                                <ColorPickerCustom
                                  label="Punto medio (opcional)"
                                  color={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name={`slides.${index}.href`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <Label>URL destino</Label>
                      <FormControl>
                        <Input {...field} placeholder="/products" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personalización Visual Avanzada */}
                <div className="sm:col-span-2 space-y-6 pt-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Personalización Visual Avanzada
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Typography */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.typography.titleFont`}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs">Fuente del Título</Label>
                            <Select onValueChange={field.onChange} value={field.value || "font-sans"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="font-sans">Inter (Sans)</SelectItem>
                                <SelectItem value="font-serif">Playfair Display (Serif)</SelectItem>
                                <SelectItem value="font-display">Montserrat (Display)</SelectItem>
                                <SelectItem value="font-outfit">Outfit (Modern)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.titleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Título"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.subtitleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Subtítulo"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.customColors.useCustom`}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2 rounded-lg border bg-muted/20 p-3">
                            <input
                              type="checkbox"
                              id={`use-custom-${index}`}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`use-custom-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Usar colores HEX personalizados
                            </Label>
                          </div>
                        )}
                      />

                      {form.watch(`slides.${index}.customColors.useCustom`) && (
                        <div className="space-y-4 rounded-xl border bg-background/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Configuración de Degradado
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Inicio"
                                    color={field.value || "#000000"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Fin"
                                    color={field.value || "#1a1a1a"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`slides.${index}.customColors.gradient.via`}
                            render={({ field }) => (
                              <FormItem>
                                <ColorPickerCustom
                                  label="Punto medio (opcional)"
                                  color={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name={`slides.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <Label>Descripción</Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personalización Visual Avanzada */}
                <div className="sm:col-span-2 space-y-6 pt-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Personalización Visual Avanzada
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Typography */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.typography.titleFont`}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs">Fuente del Título</Label>
                            <Select onValueChange={field.onChange} value={field.value || "font-sans"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="font-sans">Inter (Sans)</SelectItem>
                                <SelectItem value="font-serif">Playfair Display (Serif)</SelectItem>
                                <SelectItem value="font-display">Montserrat (Display)</SelectItem>
                                <SelectItem value="font-outfit">Outfit (Modern)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.titleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Título"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.subtitleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Subtítulo"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.customColors.useCustom`}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2 rounded-lg border bg-muted/20 p-3">
                            <input
                              type="checkbox"
                              id={`use-custom-${index}`}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`use-custom-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Usar colores HEX personalizados
                            </Label>
                          </div>
                        )}
                      />

                      {form.watch(`slides.${index}.customColors.useCustom`) && (
                        <div className="space-y-4 rounded-xl border bg-background/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Configuración de Degradado
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Inicio"
                                    color={field.value || "#000000"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Fin"
                                    color={field.value || "#1a1a1a"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`slides.${index}.customColors.gradient.via`}
                            render={({ field }) => (
                              <FormItem>
                                <ColorPickerCustom
                                  label="Punto medio (opcional)"
                                  color={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name={`slides.${index}.image`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <Label>URL imagen</Label>
                      <div className="flex gap-4">
                        <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg border bg-muted shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={field.value || "/placeholder.svg"} 
                            alt="" 
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                          />
                          {!field.value && (
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground uppercase tracking-tight">
                              Sin imagen
                            </div>
                          )}
                        </div>
                        <FormControl>
                          <Input {...field} type="url" placeholder="https://images.unsplash.com/..." />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personalización Visual Avanzada */}
                <div className="sm:col-span-2 space-y-6 pt-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Personalización Visual Avanzada
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Typography */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.typography.titleFont`}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs">Fuente del Título</Label>
                            <Select onValueChange={field.onChange} value={field.value || "font-sans"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="font-sans">Inter (Sans)</SelectItem>
                                <SelectItem value="font-serif">Playfair Display (Serif)</SelectItem>
                                <SelectItem value="font-display">Montserrat (Display)</SelectItem>
                                <SelectItem value="font-outfit">Outfit (Modern)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.titleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Título"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.subtitleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Subtítulo"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.customColors.useCustom`}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2 rounded-lg border bg-muted/20 p-3">
                            <input
                              type="checkbox"
                              id={`use-custom-${index}`}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`use-custom-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Usar colores HEX personalizados
                            </Label>
                          </div>
                        )}
                      />

                      {form.watch(`slides.${index}.customColors.useCustom`) && (
                        <div className="space-y-4 rounded-xl border bg-background/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Configuración de Degradado
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Inicio"
                                    color={field.value || "#000000"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Fin"
                                    color={field.value || "#1a1a1a"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`slides.${index}.customColors.gradient.via`}
                            render={({ field }) => (
                              <FormItem>
                                <ColorPickerCustom
                                  label="Punto medio (opcional)"
                                  color={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name={`slides.${index}.gradient`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>Degradado base</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HERO_GRADIENT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personalización Visual Avanzada */}
                <div className="sm:col-span-2 space-y-6 pt-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Personalización Visual Avanzada
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Typography */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.typography.titleFont`}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs">Fuente del Título</Label>
                            <Select onValueChange={field.onChange} value={field.value || "font-sans"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="font-sans">Inter (Sans)</SelectItem>
                                <SelectItem value="font-serif">Playfair Display (Serif)</SelectItem>
                                <SelectItem value="font-display">Montserrat (Display)</SelectItem>
                                <SelectItem value="font-outfit">Outfit (Modern)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.titleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Título"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.subtitleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Subtítulo"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.customColors.useCustom`}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2 rounded-lg border bg-muted/20 p-3">
                            <input
                              type="checkbox"
                              id={`use-custom-${index}`}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`use-custom-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Usar colores HEX personalizados
                            </Label>
                          </div>
                        )}
                      />

                      {form.watch(`slides.${index}.customColors.useCustom`) && (
                        <div className="space-y-4 rounded-xl border bg-background/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Configuración de Degradado
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Inicio"
                                    color={field.value || "#000000"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Fin"
                                    color={field.value || "#1a1a1a"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`slides.${index}.customColors.gradient.via`}
                            render={({ field }) => (
                              <FormItem>
                                <ColorPickerCustom
                                  label="Punto medio (opcional)"
                                  color={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name={`slides.${index}.overlayTint`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>Tinte encima</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HERO_TINT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personalización Visual Avanzada */}
                <div className="sm:col-span-2 space-y-6 pt-6 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Personalización Visual Avanzada
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Typography */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.typography.titleFont`}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-xs">Fuente del Título</Label>
                            <Select onValueChange={field.onChange} value={field.value || "font-sans"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="font-sans">Inter (Sans)</SelectItem>
                                <SelectItem value="font-serif">Playfair Display (Serif)</SelectItem>
                                <SelectItem value="font-display">Montserrat (Display)</SelectItem>
                                <SelectItem value="font-outfit">Outfit (Modern)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.titleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Título"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`slides.${index}.typography.subtitleColor`}
                          render={({ field }) => (
                            <FormItem>
                              <ColorPickerCustom
                                label="Color Subtítulo"
                                color={field.value || "#ffffff"}
                                onChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Colors Section */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`slides.${index}.customColors.useCustom`}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2 rounded-lg border bg-muted/20 p-3">
                            <input
                              type="checkbox"
                              id={`use-custom-${index}`}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`use-custom-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Usar colores HEX personalizados
                            </Label>
                          </div>
                        )}
                      />

                      {form.watch(`slides.${index}.customColors.useCustom`) && (
                        <div className="space-y-4 rounded-xl border bg-background/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Configuración de Degradado
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Inicio"
                                    color={field.value || "#000000"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`slides.${index}.customColors.gradient.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <ColorPickerCustom
                                    label="Color Fin"
                                    color={field.value || "#1a1a1a"}
                                    onChange={field.onChange}
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`slides.${index}.customColors.gradient.via`}
                            render={({ field }) => (
                              <FormItem>
                                <ColorPickerCustom
                                  label="Punto medio (opcional)"
                                  color={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                name="tintOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Intensidad tinte ({field.value}%)</Label>
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
                name="sideShadeOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Sombra lateral ({field.value}%)</Label>
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
                name="radialHighlightOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Highlight radial ({field.value}%)</Label>
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
                name="radialShadowOpacity"
                render={({ field }) => (
                  <FormItem>
                    <Label>Sombra radial ({field.value}%)</Label>
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