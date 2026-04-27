"use client"

import { useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { BellRing, CreditCard, Globe2, Loader2, Save, SlidersHorizontal, Store } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useSettingsStore } from "@/stores/settings-store"

const generalSchema = z.object({
  storeName: z.string().min(1, "El nombre es requerido"),
  storeEmail: z.string().email("Email inválido"),
  storePhone: z.string().min(1, "El teléfono es requerido"),
  storeAddress: z.string().min(1, "La dirección es requerida"),
  storeDescription: z.string().min(1, "La descripción es requerida"),
  timezone: z.string(),
  currency: z.string(),
})

const socialLinksSchema = z.object({
  facebook: z.string().url("URL inválida").or(z.literal("")),
  twitter: z.string().url("URL inválida").or(z.literal("")),
  instagram: z.string().url("URL inválida").or(z.literal("")),
  youtube: z.string().url("URL inválida").or(z.literal("")),
  tiktok: z.string().url("URL inválida").or(z.literal("")),
})

type GeneralForm = z.infer<typeof generalSchema>
type SocialLinksForm = z.infer<typeof socialLinksSchema>

function SettingsMetricPane({
  title,
  subtitle,
  value,
  helper,
  icon: Icon,
}: {
  title: string
  subtitle: string
  value: string
  helper: string
  icon: LucideIcon
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-3 p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-[clamp(1.7rem,2vw,2.2rem)] font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </div>
    </div>
  )
}

function SettingsSummaryBand({
  storeName,
  timezone,
  currency,
  enabledNotifications,
  enabledPayments,
  activeSocialLinks,
}: {
  storeName: string
  timezone: string
  currency: string
  enabledNotifications: number
  enabledPayments: number
  activeSocialLinks: number
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/95 shadow-sm">
      <CardContent className="p-0">
        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)] xl:divide-x xl:divide-border/60">
          <div className="flex flex-col gap-4 p-4 lg:p-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-[var(--myotd-red-border)] bg-[var(--myotd-red-soft)] text-[var(--myotd-red)] hover:bg-[var(--myotd-red-soft)]">
                  Ajustes
                </Badge>
                <span className="text-xs text-muted-foreground">Centro de configuración de la tienda</span>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Tienda activa</p>
                <h2 className="text-[clamp(2.2rem,3.3vw,3.2rem)] font-semibold tracking-tight">{storeName}</h2>
              </div>

              <p className="text-sm text-muted-foreground">
                {timezone} · Moneda {currency.toUpperCase()} · {activeSocialLinks} red{activeSocialLinks === 1 ? "" : "es"} configurada{activeSocialLinks === 1 ? "" : "s"}.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Notificaciones</p>
                <p className="mt-1 font-medium text-foreground">{enabledNotifications} activas</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Pagos</p>
                <p className="mt-1 font-medium text-foreground">{enabledPayments} métodos</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.18] px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground">Redes</p>
                <p className="mt-1 font-medium text-foreground">{activeSocialLinks} configuradas</p>
              </div>
            </div>
          </div>

          <SettingsMetricPane
            title="General"
            subtitle="Identidad de la tienda"
            value={currency.toUpperCase()}
            helper="Moneda actual de operación."
            icon={Store}
          />
          <SettingsMetricPane
            title="Notificaciones"
            subtitle="Canales y alertas"
            value={String(enabledNotifications)}
            helper="Automatizaciones activas por email."
            icon={BellRing}
          />
          <SettingsMetricPane
            title="Pagos"
            subtitle="Métodos habilitados"
            value={String(enabledPayments)}
            helper="Canales activos para cobrar."
            icon={CreditCard}
          />
        </div>
      </CardContent>
    </Card>
  )
}

const settingsTabs = [
  {
    value: "general",
    label: "General",
    description: "Identidad base",
    icon: Store,
  },
  {
    value: "store",
    label: "Tienda",
    description: "Catálogo y envío",
    icon: SlidersHorizontal,
  },
  {
    value: "social",
    label: "Redes Sociales",
    description: "Canales públicos",
    icon: Globe2,
  },
  {
    value: "notifications",
    label: "Notificaciones",
    description: "Alertas y emails",
    icon: BellRing,
  },
  {
    value: "payments",
    label: "Pagos",
    description: "Métodos de cobro",
    icon: CreditCard,
  },
] as const

export default function AdminSettingsPage() {
  const {
    general,
    socialLinks,
    storeConfig,
    notifications,
    paymentMethods,
    loading,
    saveSettings,
    updateGeneral,
    updateSocialLinks,
    updateStoreConfig,
    updateNotifications,
    updatePaymentMethods,
  } = useSettingsStore()

  const [saving, setSaving] = useState(false)

  const generalForm = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: general,
  })

  const socialForm = useForm<SocialLinksForm>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: socialLinks,
  })

  // Sincronizar formularios cuando los datos cargan de la API
  useEffect(() => {
    generalForm.reset(general)
    socialForm.reset(socialLinks)
  }, [general, socialLinks, generalForm, socialForm])

  const onSave = async (silent = false) => {
    if (!silent) setSaving(true)
    try {
      await saveSettings()
      if (!silent) toast.success("Configuración guardada correctamente")
    } catch {
      if (!silent) toast.error("Error al guardar la configuración")
    } finally {
      if (!silent) setSaving(false)
    }
  }

  const onSubmitGeneral = (data: GeneralForm) => {
    updateGeneral(data)
    onSave()
  }

  const onSubmitSocialLinks = (data: SocialLinksForm) => {
    updateSocialLinks(data)
    onSave()
  }

  const handleStoreConfigChange = async (updates: Partial<typeof storeConfig>) => {
    updateStoreConfig(updates)
    await onSave(true)
  }

  const handleNotificationsChange = async (updates: Partial<typeof notifications>) => {
    updateNotifications(updates)
    await onSave(true)
  }

  const handlePaymentMethodsChange = async (updates: Partial<typeof paymentMethods>) => {
    updatePaymentMethods(updates)
    await onSave(true)
  }

  const enabledNotifications = Object.values(notifications).filter(Boolean).length
  const enabledPayments = Object.values(paymentMethods).filter(Boolean).length
  const activeSocialLinks = Object.values(socialLinks).filter((value) => value.trim().length > 0).length

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Administra la configuración de tu tienda
          </p>
        </div>
        <Button onClick={() => onSave()} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Todo
        </Button>
      </div>

      <SettingsSummaryBand
        storeName={general.storeName}
        timezone={general.timezone}
        currency={general.currency}
        enabledNotifications={enabledNotifications}
        enabledPayments={enabledPayments}
        activeSocialLinks={activeSocialLinks}
      />

      <Tabs defaultValue="general" className="space-y-4">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="p-3">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl bg-muted/[0.18] p-1 md:grid-cols-2 xl:grid-cols-5">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="h-auto items-start justify-start gap-3 rounded-xl border border-transparent px-3 py-3 text-left data-[state=active]:border-[var(--myotd-red-border)] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/80 text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-sm font-medium">{tab.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{tab.description}</span>
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </CardContent>
        </Card>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle>Información de la Tienda</CardTitle>
              <CardDescription>
                Configura la información básica de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="storeName"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Nombre de la tienda</Label>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generalForm.control}
                      name="storeEmail"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Email de contacto</Label>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="storePhone"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Teléfono</Label>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generalForm.control}
                      name="storeAddress"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Dirección</Label>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={generalForm.control}
                    name="storeDescription"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Descripción</Label>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator className="my-4" />
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Zona horaria</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="america-lima">America/Lima (GMT-5)</SelectItem>
                              <SelectItem value="america-bogota">America/Bogota (GMT-5)</SelectItem>
                              <SelectItem value="america-mexico">America/Mexico_City (GMT-6)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generalForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Moneda</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pen">Soles (S/)</SelectItem>
                              <SelectItem value="usd">Dolares ($)</SelectItem>
                              <SelectItem value="eur">Euros (EUR)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle>Configuración de Productos</CardTitle>
              <CardDescription>
                Configura como se muestran los productos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mostrar productos agotados</p>
                  <p className="text-sm text-muted-foreground">
                    Los productos sin stock se mostrarán como &quot;Agotado&quot;
                  </p>
                </div>
                <Switch
                  checked={storeConfig.showOutOfStock}
                  onCheckedChange={(checked) => handleStoreConfigChange({ showOutOfStock: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mostrar cantidad en stock</p>
                  <p className="text-sm text-muted-foreground">
                    Muestra cuantas unidades quedan disponibles
                  </p>
                </div>
                <Switch
                  checked={storeConfig.showStockQuantity}
                  onCheckedChange={(checked) => handleStoreConfigChange({ showStockQuantity: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir resenas de productos</p>
                  <p className="text-sm text-muted-foreground">
                    Los clientes pueden dejar resenas en productos
                  </p>
                </div>
                <Switch
                  checked={storeConfig.allowReviews}
                  onCheckedChange={(checked) => handleStoreConfigChange({ allowReviews: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle>Envío</CardTitle>
              <CardDescription>
                Configura las opciones de envío
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Costo de envío estándar</Label>
                  <Input
                    type="number"
                    value={storeConfig.standardShippingCost}
                    onChange={(e) => {
                      updateStoreConfig({ standardShippingCost: Number(e.target.value) })
                    }}
                    onBlur={() => onSave(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Envío gratis desde (S/)</Label>
                  <Input
                    type="number"
                    value={storeConfig.freeShippingThreshold}
                    onChange={(e) => {
                      updateStoreConfig({ freeShippingThreshold: Number(e.target.value) })
                    }}
                    onBlur={() => onSave(true)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={() => onSave()} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Configuración de Tienda
            </Button>
          </div>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social" className="space-y-6">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>
                Configura los enlaces a tus redes sociales. Deja vacío si no tienes.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Form {...socialForm}>
                <form onSubmit={socialForm.handleSubmit(onSubmitSocialLinks)} className="space-y-4">
                  <FormField
                    control={socialForm.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Facebook</Label>
                        <FormControl>
                          <Input placeholder="https://facebook.com/tu-pagina" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialForm.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Twitter / X</Label>
                        <FormControl>
                          <Input placeholder="https://x.com/tu-usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialForm.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Instagram</Label>
                        <FormControl>
                          <Input placeholder="https://instagram.com/tu-usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialForm.control}
                    name="youtube"
                    render={({ field }) => (
                      <FormItem>
                        <Label>YouTube</Label>
                        <FormControl>
                          <Input placeholder="https://youtube.com/tu-canal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialForm.control}
                    name="tiktok"
                    render={({ field }) => (
                      <FormItem>
                        <Label>TikTok</Label>
                        <FormControl>
                          <Input placeholder="https://tiktok.com/@tu-usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Redes Sociales
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle>Notificaciones por Email</CardTitle>
              <CardDescription>
                Configura qué notificaciones recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nuevos pedidos</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe un email cuando hay un nuevo pedido
                  </p>
                </div>
                <Switch
                  checked={notifications.newOrders}
                  onCheckedChange={(checked) => handleNotificationsChange({ newOrders: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pagos fallidos</p>
                  <p className="text-sm text-muted-foreground">
                    Notificación cuando un pago falla
                  </p>
                </div>
                <Switch
                  checked={notifications.failedPayments}
                  onCheckedChange={(checked) => handleNotificationsChange({ failedPayments: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Stock bajo</p>
                  <p className="text-sm text-muted-foreground">
                    Alerta cuando un producto tiene poco stock
                  </p>
                </div>
                <Switch
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) => handleNotificationsChange({ lowStock: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nuevos usuarios</p>
                  <p className="text-sm text-muted-foreground">
                    Notificación cuando se registra un nuevo usuario
                  </p>
                </div>
                <Switch
                  checked={notifications.newUsers}
                  onCheckedChange={(checked) => handleNotificationsChange({ newUsers: checked })}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={() => onSave()} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Notificaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-6">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="px-4 pb-2 pt-4">
              <CardTitle>Metodos de Pago</CardTitle>
              <CardDescription>
                Habilita o deshabilita metodos de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tarjetas de credito/debito</p>
                  <p className="text-sm text-muted-foreground">
                    Visa, Mastercard, American Express
                  </p>
                </div>
                <Switch
                  checked={paymentMethods.card}
                  onCheckedChange={(checked) => handlePaymentMethodsChange({ card: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transferencia bancaria</p>
                  <p className="text-sm text-muted-foreground">
                    BCP, BBVA, Interbank, Scotiabank
                  </p>
                </div>
                <Switch
                  checked={paymentMethods.transfer}
                  onCheckedChange={(checked) => handlePaymentMethodsChange({ transfer: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Billeteras digitales</p>
                  <p className="text-sm text-muted-foreground">
                    Yape, Plin, PayPal
                  </p>
                </div>
                <Switch
                  checked={paymentMethods.wallet}
                  onCheckedChange={(checked) => handlePaymentMethodsChange({ wallet: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pago contra entrega</p>
                  <p className="text-sm text-muted-foreground">
                    El cliente paga al recibir el producto
                  </p>
                </div>
                <Switch
                  checked={paymentMethods.cashOnDelivery}
                  onCheckedChange={(checked) => handlePaymentMethodsChange({ cashOnDelivery: checked })}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={() => onSave()} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Métodos de Pago
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
