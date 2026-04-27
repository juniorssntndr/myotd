"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Shirt, Watch, Footprints, Sparkles, User, Heart, Package, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

const categories = [
  { name: "Polos", href: "/products?category=polos", icon: Shirt },
  { name: "Hoodies", href: "/products?category=hoodies", icon: Shirt },
  { name: "Zapatillas", href: "/products?category=zapatillas", icon: Footprints },
  { name: "Accesorios", href: "/products?category=accesorios", icon: Watch },
  { name: "Ofertas", href: "/products?category=ofertas", icon: Sparkles },
]

const navLinks = [
  { name: "Inicio", href: "/", icon: Sparkles },
  { name: "Catálogo", href: "/products", icon: ShoppingBag },
  { name: "Ofertas", href: "/products?category=ofertas", icon: Sparkles },
  { name: "Mi Cuenta", href: "/profile", icon: User },
  { name: "Carrito", href: "/cart", icon: ShoppingBag },
]

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          {/* Nav Links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </div>

          <Separator />

          {/* User Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Mi Cuenta
            </Link>
            <Link
              href="/profile/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <Heart className="h-4 w-4" />
              Favoritos
            </Link>
            <Link
              href="/profile/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <Package className="h-4 w-4" />
              Mis Pedidos
            </Link>
          </div>

          <Separator />

          {/* Categories */}
          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
              Categorías
            </p>
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </Link>
            ))}
          </div>

          <Separator />

          {/* All Products */}
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-lg bg-[#E11D48] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#E11D48]/90"
          >
            Ver Todo el Catálogo
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
