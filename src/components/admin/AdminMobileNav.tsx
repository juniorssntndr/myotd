"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, Store } from "lucide-react"

import { adminNavigationSections, isAdminNavItemActive } from "@/lib/admin-navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function AdminMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Image src="/myotd-logo.png" alt="Myotd" width={130} height={46} className="h-9 w-auto" />
            Admin Panel
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 space-y-1 p-4">
          {adminNavigationSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {section.title}
              </p>
              {section.items.map((item) => {
                const isActive = isAdminNavItemActive(pathname, item)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-medium">{item.name}</span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xs",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}
                      >
                        {item.description}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="border-t p-4">
          <Button asChild variant="outline" className="w-full justify-start" onClick={() => setOpen(false)}>
            <Link href="/">
              <Store className="mr-2 h-4 w-4" />
              Volver a la Tienda
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
