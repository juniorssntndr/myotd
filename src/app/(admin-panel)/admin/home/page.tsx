import Link from "next/link"
import { ArrowRight, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getHomeVisualSettings } from "@/lib/settings-service"
import { adminHomeVisualLinks } from "@/lib/admin-navigation"

export default async function AdminHomePage() {
  const homeVisual = await getHomeVisualSettings()

  const metrics = {
    slides: homeVisual.hero.slides.length,
    brandOverrides: Object.keys(homeVisual.brands.brandOverrides).length,
    offerOverrides: Object.keys(homeVisual.featuredOffers.categoryOverrides).length,
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="space-y-3">
        <Badge className="rounded-full border border-[var(--myotd-red-border)] bg-[var(--myotd-red-soft)] text-[var(--myotd-red)] hover:bg-[var(--myotd-red-soft)]">
          Storefront
        </Badge>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Home visual</h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              Este apartado administra la experiencia del inicio. Separé Hero, Marcas y Ofertas de
              Configuración para que el equipo trabaje por bloques visuales y no mezcle ajustes
              operativos con storefront.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/settings">Ir a configuración operativa</Link>
            </Button>
            <Button asChild>
              <Link href="/">
                Ver tienda
                <Eye className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Slides hero</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{metrics.slides}</p>
            <p className="mt-1 text-sm text-muted-foreground">Bloques principales del banner superior.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Overrides marcas</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{metrics.brandOverrides}</p>
            <p className="mt-1 text-sm text-muted-foreground">Personalizaciones visuales activas por slug.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Overrides ofertas</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{metrics.offerOverrides}</p>
            <p className="mt-1 text-sm text-muted-foreground">Ajustes de tono e imagen por categoría.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {adminHomeVisualLinks.map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.href} className="border-border/60 bg-card/95 shadow-sm">
              <CardHeader className="space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription className="mt-2">{item.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full justify-between">
                  <Link href={item.href}>
                    Abrir editor
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
