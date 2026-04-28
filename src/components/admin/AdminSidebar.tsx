"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Store } from "lucide-react"

import { adminNavigationSections, isAdminNavItemActive } from "@/lib/admin-navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Image src="/myotd-logo.png" alt="Myotd" width={130} height={46} className="h-9 w-auto shrink-0" />
        <span className="font-bold">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto p-4">
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

      {/* Back to Store */}
      <div className="border-t p-4">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/">
            <Store className="mr-2 h-4 w-4" />
            Volver a la Tienda
          </Link>
        </Button>
      </div>
    </aside>
  )
}
