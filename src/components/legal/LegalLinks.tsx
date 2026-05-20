import Link from "next/link"
import { cn } from "@/lib/utils"

const legalLinks = [
  { href: "/terminos-y-condiciones", label: "Términos y Condiciones" },
  { href: "/politica-de-privacidad", label: "Política de Privacidad" },
  { href: "/politica-de-cambios-y-devoluciones", label: "Cambios y Devoluciones" },
] as const

type LegalLinksProps = {
  className?: string
  linkClassName?: string
  separator?: string
}

export function LegalLinks({ className, linkClassName, separator = " · " }: LegalLinksProps) {
  return (
    <p className={cn("text-center text-xs text-muted-foreground", className)}>
      {legalLinks.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? separator : null}
          <Link href={link.href} className={cn("underline underline-offset-2 hover:text-foreground", linkClassName)}>
            {link.label}
          </Link>
        </span>
      ))}
    </p>
  )
}

export { legalLinks }
