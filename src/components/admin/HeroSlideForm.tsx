import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ColorPickerCustom } from "@/components/admin/ColorPickerCustom"
import { HERO_GRADIENT_OPTIONS, homeHeroFormSchema } from "@/lib/home-visual"

type HeroFormValues = z.infer<typeof homeHeroFormSchema>

interface HeroSlideFormProps {
  form: UseFormReturn<HeroFormValues>
  index: number
}

export function HeroSlideForm({ form, index }: HeroSlideFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
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

      {/* Advanced Visual Customization */}
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
    </div>
  )
}
