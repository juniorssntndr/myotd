"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
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
                <Link href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {socialLinks.twitter && (
                <Link href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                </Link>
              )}
              {socialLinks.instagram && (
                <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {socialLinks.youtube && (
                <Link href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Youtube className="h-5 w-5" />
                </Link>
              )}
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
