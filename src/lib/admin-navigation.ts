import type { LucideIcon } from "lucide-react"
import {
  CreditCard,
  Images,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  Sparkles,
  Store,
  Users,
} from "lucide-react"

export type AdminNavigationItem = {
  name: string
  href: string
  icon: LucideIcon
  description: string
  aliases?: string[]
}

export type AdminNavigationSection = {
  title: string
  items: AdminNavigationItem[]
}

export const adminHomeVisualLinks: AdminNavigationItem[] = [
  {
    name: "Hero principal",
    href: "/admin/home/hero",
    icon: Images,
    description: "Slides, gradientes, CTA e imagen principal.",
  },
  {
    name: "Carrusel de marcas",
    href: "/admin/home/brands",
    icon: Sparkles,
    description: "Overrides visuales para marcas destacadas desde catálogo.",
  },
  {
    name: "Ofertas destacadas",
    href: "/admin/home/featured-offers",
    icon: Percent,
    description: "Tarjetas derivadas del catálogo con control visual por categoría.",
  },
]

export const adminNavigationSections: AdminNavigationSection[] = [
  {
    title: "Operación",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        description: "Métricas, pedidos y performance.",
      },
      {
        name: "Catálogo",
        href: "/admin/products",
        icon: Package,
        description: "Productos, stock y catálogo activo.",
      },
      {
        name: "Pagos",
        href: "/admin/payments",
        icon: CreditCard,
        description: "Cobros, estados y conciliación.",
      },
      {
        name: "Usuarios",
        href: "/admin/users",
        icon: Users,
        description: "Clientes y administración interna.",
      },
    ],
  },
  {
    title: "Storefront",
    items: [
      {
        name: "Home",
        href: "/admin/home",
        icon: Store,
        description: "Hero, marcas y ofertas del inicio.",
        aliases: adminHomeVisualLinks.flatMap((item) => [item.href, ...(item.aliases ?? [])]),
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        name: "Configuración",
        href: "/admin/settings",
        icon: Settings,
        description: "Ajustes operativos, pagos y contacto.",
      },
    ],
  },
]

function matchesItem(pathname: string, item: AdminNavigationItem) {
  if (pathname === item.href) {
    return true
  }

  if (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)) {
    return true
  }

  return item.aliases?.some((alias) => pathname === alias || pathname.startsWith(`${alias}/`)) ?? false
}

export function isAdminNavItemActive(pathname: string, item: AdminNavigationItem) {
  return matchesItem(pathname, item)
}

export function getAdminPageMeta(pathname: string) {
  for (const item of adminHomeVisualLinks) {
    if (matchesItem(pathname, item)) {
      return {
        title: item.name,
        description: item.description,
      }
    }
  }

  for (const section of adminNavigationSections) {
    for (const item of section.items) {
      if (matchesItem(pathname, item)) {
        return {
          title: item.name,
          description: item.description,
        }
      }
    }
  }

  return {
    title: "Admin",
    description: "Operación y configuración de la tienda.",
  }
}
