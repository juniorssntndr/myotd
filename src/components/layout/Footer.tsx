"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useSettingsStore } from "@/stores/settings-store"

const footerLinks = {
  productos: [
    { name: "Polos", href: "/products?category=polos" },
    { name: "Hoodies", href: "/products?category=hoodies" },
    { name: "Zapatillas", href: "/products?category=zapatillas" },
    { name: "Accesorios", href: "/products?category=accesorios" },
    { name: "Destacados", href: "/products?featured=true" },
  ],
  empresa: [
    { name: "Inicio", href: "/" },
    { name: "Catalogo", href: "/products" },
    { name: "Ingresar", href: "/login" },
    { name: "Crear cuenta", href: "/register" },
  ],
  ayuda: [
    { name: "Carrito", href: "/cart" },
    { name: "Checkout", href: "/checkout" },
    { name: "Mis pedidos", href: "/profile/orders" },
    { name: "Direcciones", href: "/profile/addresses" },
    { name: "Configuración", href: "/profile/settings" },

  ],
  legal: [
    { name: "Login seguro", href: "/login" },
    { name: "Registro", href: "/register" },
    { name: "Mi cuenta", href: "/profile" },
  ],
}

export function Footer() {
  const { socialLinks, general } = useSettingsStore()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/myotd-logo.png" alt="Myotd" width={170} height={60} className="h-12 w-auto shrink-0" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {general.storeDescription || "Moda urbana multimarca para Perú. Envíos a todo el Perú • Wholesale disponible"}
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.facebook && (
                <Link href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {socialLinks.instagram && (
                <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {socialLinks.tiktok && (
                <Link href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-foreground transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </Link>
              )}
            </div>
            <div className="mt-8">
              <Link 
                href="https://www.librovirtual.pe/r/carta-oblitas-santiago-cristhian" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-white p-2 rounded-md shadow-sm border border-border/40 hover:shadow-md transition-all duration-300"
              >
                <img 
                  src="https://cdn.librovirtual.pe/assets/generic/libro-virtual.png?v=1778193557.7386" 
                  alt="Libro de Reclamaciones"
                  className="h-12 w-auto"
                />
              </Link>
              <p className="mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Libro de Reclamaciones
              </p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold">Moda</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.productos.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold">Empresa</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold">Ayuda</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.ayuda.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold">Contacto</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{general.storeAddress || "Av. Lima 123, Lima, Peru"}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{general.storePhone || "+51 999 888 777"}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{general.storeEmail || "info@myotd.pe"}</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Myotd. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
             {footerLinks.legal.map((link) => (
               <Link
                 key={link.name}
                 href={link.href}
                 className="text-xs text-muted-foreground hover:text-foreground"
               >
                 {link.name}
               </Link>
             ))}
           </div>
         </div>
       </div>
     </footer>
  )
}
